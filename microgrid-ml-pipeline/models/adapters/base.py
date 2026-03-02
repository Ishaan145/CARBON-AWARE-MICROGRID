"""
Base Model Adapter Interface

All model adapters must inherit from this base class to ensure
consistent interface across DeepAR, LSTM, and XGBoost models.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Any
import numpy as np


class BaseModelAdapter(ABC):
    """
    Abstract base class for all model adapters.
    
    Ensures all models provide consistent prediction interface
    with quantile outputs.
    """
    
    def __init__(self, model_path: str, config: Dict[str, Any]):
        """
        Initialize model adapter.
        
        Args:
            model_path: Path to model binary file
            config: Model configuration dictionary
        """
        self.model_path = model_path
        self.config = config
        self.model = None
        self.is_loaded = False
        self.version = config.get('version', '1.0.0')
        
    @abstractmethod
    def load_model(self) -> None:
        """
        Load model from disk.
        
        Must be implemented by each adapter.
        Should set self.model and self.is_loaded = True
        """
        pass
    
    @abstractmethod
    def predict(self, features: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Generate predictions with quantile outputs.
        
        Args:
            features: Input features array of shape (batch_size, context_length, n_features)
                     or (context_length, n_features) for single prediction
        
        Returns:
            Dictionary with keys:
                - 'q10': 10th percentile forecast (lower bound)
                - 'q50': 50th percentile forecast (median)
                - 'q90': 90th percentile forecast (upper bound)
            
            Each value is np.ndarray of shape (batch_size, horizon) or (horizon,)
        """
        pass
    
    def validate_input(self, features: np.ndarray) -> None:
        """
        Validate input features shape and type.
        
        Args:
            features: Input feature array
            
        Raises:
            ValueError: If input shape is invalid
            TypeError: If input type is incorrect
        """
        if not isinstance(features, np.ndarray):
            raise TypeError(f"Expected numpy array, got {type(features)}")
        
        if features.ndim not in [2, 3]:
            raise ValueError(
                f"Expected 2D or 3D array, got {features.ndim}D array. "
                f"Shape should be (context_length, n_features) or "
                f"(batch_size, context_length, n_features)"
            )
    
    def validate_output(self, output: Dict[str, np.ndarray]) -> None:
        """
        Validate output structure.
        
        Args:
            output: Prediction output dictionary
            
        Raises:
            ValueError: If output structure is invalid
        """
        required_keys = {'q10', 'q50', 'q90'}
        if not required_keys.issubset(output.keys()):
            missing = required_keys - set(output.keys())
            raise ValueError(f"Missing required keys in output: {missing}")
        
        # Check all quantiles have same shape
        shapes = [output[k].shape for k in required_keys]
        if len(set(shapes)) > 1:
            raise ValueError(f"Quantile outputs have different shapes: {shapes}")
    
    def get_info(self) -> Dict[str, Any]:
        """
        Get model information.
        
        Returns:
            Dictionary with model metadata
        """
        return {
            'model_path': self.model_path,
            'version': self.version,
            'is_loaded': self.is_loaded,
            'config': self.config
        }
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(version={self.version}, loaded={self.is_loaded})"


class ModelAdapterFactory:
    """
    Factory class for creating model adapters.
    """
    
    _adapters = {}
    
    @classmethod
    def register_adapter(cls, model_type: str, adapter_class: type):
        """
        Register a new adapter type.
        
        Args:
            model_type: Type identifier (e.g., 'deepar', 'lstm', 'xgboost')
            adapter_class: Adapter class (must inherit from BaseModelAdapter)
        """
        if not issubclass(adapter_class, BaseModelAdapter):
            raise TypeError(f"{adapter_class} must inherit from BaseModelAdapter")
        cls._adapters[model_type.lower()] = adapter_class
    
    @classmethod
    def create_adapter(cls, model_type: str, model_path: str, config: Dict[str, Any]) -> BaseModelAdapter:
        """
        Create model adapter instance.
        
        Args:
            model_type: Type of model ('deepar', 'lstm', 'xgboost')
            model_path: Path to model file
            config: Model configuration
            
        Returns:
            Initialized adapter instance
            
        Raises:
            ValueError: If model_type is not registered
        """
        model_type = model_type.lower()
        if model_type not in cls._adapters:
            raise ValueError(
                f"Unknown model type '{model_type}'. "
                f"Registered types: {list(cls._adapters.keys())}"
            )
        
        adapter_class = cls._adapters[model_type]
        return adapter_class(model_path, config)
    
    @classmethod
    def list_adapters(cls) -> List[str]:
        """List all registered adapter types."""
        return list(cls._adapters.keys())
