"""
LSTM Model Adapter

Handles loading and inference for LSTM residual correction models.
"""

import numpy as np
import pickle
from typing import Dict, Any
from pathlib import Path

from .base import BaseModelAdapter, ModelAdapterFactory


class LSTMAdapter(BaseModelAdapter):
    """
    Adapter for LSTM residual forecasting models.
    
    LSTM is used to capture nonlinear temporal patterns and correct
    residuals from the DeepAR base forecast.
    """
    
    def __init__(self, model_path: str, config: Dict[str, Any]):
        super().__init__(model_path, config)
        self.hidden_size = config.get('hidden_size', 128)
        self.num_layers = config.get('num_layers', 2)
        self.dropout = config.get('dropout', 0.2)
        
    def load_model(self) -> None:
        """
        Load LSTM model from PyTorch checkpoint.
        
        Expected file format:
            torch.save({
                'model_state_dict': model.state_dict(),
                'model_config': {...}
            }, path)
        """
        model_path = Path(self.model_path)
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        try:
            # Try loading with pickle first (for placeholder)
            with open(model_path, 'rb') as f:
                checkpoint = pickle.load(f)
            
            if isinstance(checkpoint, dict) and checkpoint.get('placeholder'):
                print(f"⚠️  Warning: Loaded placeholder LSTM model from {self.model_path}")
                print("   Replace with actual trained model for production use.")
                self.model = self._create_placeholder_model()
            else:
                # Real PyTorch model loading would go here
                # import torch
                # checkpoint = torch.load(model_path)
                # self.model = LSTMModel(**checkpoint['model_config'])
                # self.model.load_state_dict(checkpoint['model_state_dict'])
                # self.model.eval()
                self.model = checkpoint
                
            self.is_loaded = True
            print(f"✓ LSTM model loaded from {self.model_path}")
            
        except Exception as e:
            raise RuntimeError(f"Failed to load LSTM model: {str(e)}")
    
    def _create_placeholder_model(self) -> Dict[str, Any]:
        """Create a placeholder model for testing."""
        return {
            'type': 'placeholder',
            'version': self.version,
            'hidden_size': self.hidden_size,
            'num_layers': self.num_layers
        }
    
    def predict(self, features: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Generate quantile forecasts using LSTM.
        
        Args:
            features: Shape (batch_size, context_length, n_features) or 
                     (context_length, n_features)
        
        Returns:
            Dictionary with quantile predictions:
                - 'q10': 10th percentile
                - 'q50': median (50th percentile)
                - 'q90': 90th percentile
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        self.validate_input(features)
        
        # Handle single vs batch input
        if features.ndim == 2:
            features = features[np.newaxis, :]  # Add batch dimension
            single_input = True
        else:
            single_input = False
        
        # --- PLACEHOLDER PREDICTION LOGIC ---
        # Replace this with actual LSTM inference
        if isinstance(self.model, dict) and self.model.get('type') == 'placeholder':
            predictions = self._placeholder_predict(features)
        else:
            # Real LSTM inference would be:
            # with torch.no_grad():
            #     q10, q50, q90 = self.model(torch.tensor(features))
            predictions = self._placeholder_predict(features)
        
        # Remove batch dimension if input was single
        if single_input:
            predictions = {k: v[0] for k, v in predictions.items()}
        
        self.validate_output(predictions)
        return predictions
    
    def _placeholder_predict(self, features: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Placeholder prediction logic for testing.
        
        Generates residual corrections based on temporal patterns.
        """
        batch_size = features.shape[0]
        horizon = 96  # 24 hours at 15-min intervals
        
        # Extract temporal features
        sequence = features[:, :, 0]  # Use first feature as target
        
        # Compute recent trend and volatility
        recent_mean = np.mean(sequence[:, -24:], axis=1)  # Last 6 hours
        recent_std = np.std(sequence[:, -24:], axis=1)
        
        # Generate residual corrections
        q50 = np.zeros((batch_size, horizon))
        
        for i in range(batch_size):
            # Add some temporal correlation
            residuals = np.zeros(horizon)
            residuals[0] = np.random.normal(0, recent_std[i] * 0.1)
            
            # AR(1) process for residuals
            for t in range(1, horizon):
                residuals[t] = 0.7 * residuals[t-1] + np.random.normal(0, recent_std[i] * 0.05)
            
            q50[i] = residuals
        
        # Add uncertainty (LSTM typically has tighter bounds than DeepAR)
        uncertainty = 0.08 * np.abs(recent_mean[:, np.newaxis])
        q10 = q50 - uncertainty
        q90 = q50 + uncertainty
        
        return {
            'q10': q10.astype(np.float32),
            'q50': q50.astype(np.float32),
            'q90': q90.astype(np.float32)
        }
    
    def get_info(self) -> Dict[str, Any]:
        """Get model information including LSTM-specific details."""
        info = super().get_info()
        info.update({
            'model_type': 'LSTM',
            'hidden_size': self.hidden_size,
            'num_layers': self.num_layers,
            'dropout': self.dropout,
            'purpose': 'residual_correction'
        })
        return info


# Register this adapter with the factory
ModelAdapterFactory.register_adapter('lstm', LSTMAdapter)
