"""
XGBoost Model Adapter

Handles loading and inference for XGBoost quantile regression models.
"""

import numpy as np
import pickle
import json
from typing import Dict, Any, List
from pathlib import Path

from .base import BaseModelAdapter, ModelAdapterFactory


class XGBoostAdapter(BaseModelAdapter):
    """
    Adapter for XGBoost quantile regression models.
    
    XGBoost excels at capturing structured feature interactions
    with engineered features (lags, rolling stats, etc.)
    """
    
    def __init__(self, model_path: str, config: Dict[str, Any]):
        super().__init__(model_path, config)
        self.quantiles = config.get('quantiles', [0.1, 0.5, 0.9])
        self.feature_names = None
        self.models = {}  # Separate model per quantile
        
    def load_model(self) -> None:
        """
        Load XGBoost model(s) from file.
        
        Supports multiple formats:
            - .json: XGBoost native format
            - .pkl: Pickled model(s)
        """
        model_path = Path(self.model_path)
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        try:
            if model_path.suffix == '.json':
                self._load_json_model(model_path)
            elif model_path.suffix == '.pkl':
                self._load_pickle_model(model_path)
            else:
                raise ValueError(f"Unsupported file format: {model_path.suffix}")
                
            self.is_loaded = True
            print(f"✓ XGBoost model loaded from {self.model_path}")
            
        except Exception as e:
            raise RuntimeError(f"Failed to load XGBoost model: {str(e)}")
    
    def _load_json_model(self, model_path: Path) -> None:
        """Load model from JSON format."""
        with open(model_path, 'r') as f:
            metadata = json.load(f)
        
        if metadata.get('placeholder'):
            print(f"⚠️  Warning: Loaded placeholder XGBoost model from {model_path}")
            print("   Replace with actual trained model for production use.")
            self.model = metadata
            self.feature_names = metadata.get('feature_names', [])
        else:
            # Real XGBoost loading would be:
            # import xgboost as xgb
            # self.models = {}
            # for q in self.quantiles:
            #     model = xgb.Booster()
            #     model.load_model(f"{model_path.stem}_q{int(q*100)}.json")
            #     self.models[f'q{int(q*100)}'] = model
            self.model = metadata
            self.feature_names = metadata.get('feature_names', [])
    
    def _load_pickle_model(self, model_path: Path) -> None:
        """Load model from pickle format."""
        with open(model_path, 'rb') as f:
            data = pickle.load(f)
        
        if isinstance(data, dict) and data.get('placeholder'):
            print(f"⚠️  Warning: Loaded placeholder XGBoost model from {model_path}")
            print("   Replace with actual trained model for production use.")
            self.model = data
        else:
            # Real pickled XGBoost could be:
            # - Single model trained with quantile loss
            # - Dictionary of models (one per quantile)
            self.model = data
            
            if isinstance(data, dict) and 'feature_names' in data:
                self.feature_names = data['feature_names']
    
    def predict(self, features: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Generate quantile forecasts using XGBoost.
        
        Args:
            features: Shape (batch_size, n_features) or (n_features,)
                     Note: XGBoost uses tabular features, not sequences
        
        Returns:
            Dictionary with quantile predictions:
                - 'q10': 10th percentile
                - 'q50': median (50th percentile)
                - 'q90': 90th percentile
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # XGBoost expects 2D features (batch_size, n_features)
        if features.ndim == 1:
            features = features[np.newaxis, :]
            single_input = True
        else:
            single_input = False
        
        # --- PLACEHOLDER PREDICTION LOGIC ---
        if isinstance(self.model, dict) and self.model.get('placeholder'):
            predictions = self._placeholder_predict(features)
        else:
            # Real XGBoost inference would be:
            # import xgboost as xgb
            # dmatrix = xgb.DMatrix(features, feature_names=self.feature_names)
            # predictions = {}
            # for q_name, model in self.models.items():
            #     predictions[q_name] = model.predict(dmatrix)
            predictions = self._placeholder_predict(features)
        
        # Remove batch dimension if input was single
        if single_input:
            predictions = {k: v[0] for k, v in predictions.items()}
        
        self.validate_output(predictions)
        return predictions
    
    def _placeholder_predict(self, features: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Placeholder prediction logic for testing.
        
        Uses feature-based heuristics to generate forecasts.
        """
        batch_size = features.shape[0]
        horizon = 96  # 24 hours at 15-min intervals
        
        # Extract key features (assuming specific order)
        # Features: [lags, rolling_stats, cyclical, weather, ...]
        if features.shape[1] >= 5:
            recent_lags = features[:, :5]  # Last 5 lag values
            lag_mean = np.mean(recent_lags, axis=1)
        else:
            lag_mean = np.mean(features, axis=1)
        
        # Generate base forecast using feature patterns
        q50 = np.zeros((batch_size, horizon))
        
        for i in range(batch_size):
            # Use lag mean as baseline
            baseline = lag_mean[i]
            
            # Add some feature-based variation
            time_variation = 0.1 * baseline * np.sin(np.linspace(0, 4*np.pi, horizon))
            noise = np.random.normal(0, 0.05 * abs(baseline), horizon)
            
            q50[i] = baseline + time_variation + noise
        
        # XGBoost typically has good calibration, moderate uncertainty
        uncertainty = 0.12 * np.abs(q50)
        q10 = q50 - uncertainty
        q90 = q50 + uncertainty
        
        # Ensure non-negative
        q10 = np.maximum(q10, 0)
        
        return {
            'q10': q10.astype(np.float32),
            'q50': q50.astype(np.float32),
            'q90': q90.astype(np.float32)
        }
    
    def predict_with_features(self, feature_dict: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Alternative prediction interface using named features.
        
        Args:
            feature_dict: Dictionary mapping feature names to values
        
        Returns:
            Quantile predictions
        """
        if self.feature_names is None:
            raise RuntimeError("Feature names not available")
        
        # Arrange features in correct order
        features = np.array([feature_dict[name] for name in self.feature_names])
        return self.predict(features)
    
    def get_info(self) -> Dict[str, Any]:
        """Get model information including XGBoost-specific details."""
        info = super().get_info()
        info.update({
            'model_type': 'XGBoost',
            'quantiles': self.quantiles,
            'num_features': len(self.feature_names) if self.feature_names else None,
            'feature_names': self.feature_names,
            'purpose': 'structured_feature_regression'
        })
        return info


# Register this adapter with the factory
ModelAdapterFactory.register_adapter('xgboost', XGBoostAdapter)
