"""
Ensemble Module

Combines predictions from multiple models using weighted quantile blending.
"""

import numpy as np
from typing import Dict, List, Optional
import yaml
from pathlib import Path


class QuantileEnsemble:
    """
    Ensemble multiple model predictions using weighted quantile blending.
    
    Combines DeepAR, LSTM, and XGBoost forecasts to produce
    final quantile predictions.
    """
    
    def __init__(self, weights_config_path: Optional[str] = None):
        """
        Initialize ensemble with weights configuration.
        
        Args:
            weights_config_path: Path to YAML file with ensemble weights
        """
        self.weights = self._load_weights(weights_config_path)
        self.adaptive_enabled = False
        self.performance_history = {
            'deepar': [],
            'lstm': [],
            'xgboost': []
        }
        
    def _load_weights(self, config_path: Optional[str]) -> Dict:
        """Load ensemble weights from configuration file."""
        if config_path is None:
            # Default equal weights
            return {
                'q10': {'deepar': 0.33, 'lstm': 0.33, 'xgboost': 0.34},
                'q50': {'deepar': 0.33, 'lstm': 0.33, 'xgboost': 0.34},
                'q90': {'deepar': 0.33, 'lstm': 0.33, 'xgboost': 0.34}
            }
        
        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            
            weights = {}
            for quantile in ['q10', 'q50', 'q90']:
                weights[quantile] = config.get(quantile, {})
                
                # Ensure weights sum to 1
                total = sum(weights[quantile].values())
                if abs(total - 1.0) > 0.01:
                    print(f"⚠️  Warning: Weights for {quantile} sum to {total}, normalizing...")
                    weights[quantile] = {k: v/total for k, v in weights[quantile].items()}
            
            # Load adaptive config if present
            if 'adaptive' in config:
                self.adaptive_enabled = config['adaptive'].get('enabled', False)
            
            print(f"✓ Loaded ensemble weights from {config_path}")
            return weights
            
        except Exception as e:
            print(f"⚠️  Failed to load weights config: {e}")
            print("   Using default equal weights")
            return self._load_weights(None)
    
    def blend_quantiles(self,
                       predictions: Dict[str, Dict[str, np.ndarray]],
                       quantiles: List[str] = ['q10', 'q50', 'q90']) -> Dict[str, np.ndarray]:
        """
        Blend predictions from multiple models.
        
        Args:
            predictions: Dictionary mapping model names to their predictions
                        {
                            'deepar': {'q10': [...], 'q50': [...], 'q90': [...]},
                            'lstm': {'q10': [...], 'q50': [...], 'q90': [...]},
                            'xgboost': {'q10': [...], 'q50': [...], 'q90': [...]}
                        }
            quantiles: List of quantile names to blend
        
        Returns:
            Blended predictions dictionary
        """
        blended = {}
        
        for quantile in quantiles:
            # Get predictions for this quantile from each model
            model_preds = []
            model_weights = []
            
            for model_name in ['deepar', 'lstm', 'xgboost']:
                if model_name in predictions and quantile in predictions[model_name]:
                    pred = predictions[model_name][quantile]
                    weight = self.weights[quantile].get(model_name, 0.0)
                    
                    model_preds.append(pred)
                    model_weights.append(weight)
            
            if not model_preds:
                raise ValueError(f"No predictions available for {quantile}")
            
            # Normalize weights to sum to 1
            weights_array = np.array(model_weights)
            weights_array = weights_array / weights_array.sum()
            
            # Weighted average
            blended[quantile] = sum(w * p for w, p in zip(weights_array, model_preds))
        
        # Ensure quantile ordering (q10 <= q50 <= q90)
        blended = self._enforce_quantile_ordering(blended)
        
        return blended
    
    def _enforce_quantile_ordering(self, predictions: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Ensure quantile predictions are properly ordered.
        
        q10 <= q50 <= q90 at each time point
        """
        if 'q10' in predictions and 'q50' in predictions and 'q90' in predictions:
            # Clip to ensure ordering
            predictions['q10'] = np.minimum(predictions['q10'], predictions['q50'])
            predictions['q90'] = np.maximum(predictions['q90'], predictions['q50'])
        
        return predictions
    
    def update_weights_adaptive(self,
                               model_name: str,
                               error: float,
                               quantile: str = 'q50'):
        """
        Update model weights based on recent performance (optional).
        
        Args:
            model_name: Name of model ('deepar', 'lstm', 'xgboost')
            error: Recent error metric (lower is better)
            quantile: Quantile to update weights for
        """
        if not self.adaptive_enabled:
            return
        
        # Store performance
        self.performance_history[model_name].append(error)
        
        # Keep last N errors only
        max_history = 1000
        if len(self.performance_history[model_name]) > max_history:
            self.performance_history[model_name] = \
                self.performance_history[model_name][-max_history:]
        
        # Recompute weights based on inverse error
        # Models with lower error get higher weight
        errors = {}
        for name in ['deepar', 'lstm', 'xgboost']:
            if self.performance_history[name]:
                errors[name] = np.mean(self.performance_history[name][-100:])
            else:
                errors[name] = 1.0  # Default
        
        # Inverse error weighting
        inv_errors = {k: 1.0 / (v + 1e-6) for k, v in errors.items()}
        total = sum(inv_errors.values())
        
        # Update weights
        new_weights = {k: v / total for k, v in inv_errors.items()}
        self.weights[quantile] = new_weights
    
    def get_weights(self) -> Dict:
        """Get current ensemble weights."""
        return self.weights
    
    def set_weights(self, weights: Dict):
        """
        Manually set ensemble weights.
        
        Args:
            weights: Dictionary of weights for each quantile
        """
        self.weights = weights


class StackingEnsemble:
    """
    Alternative ensemble method using meta-learning.
    
    Trains a meta-model on top of base model predictions.
    (Placeholder for future implementation)
    """
    
    def __init__(self):
        self.meta_model = None
        
    def fit(self, base_predictions: np.ndarray, targets: np.ndarray):
        """Train meta-model on validation predictions."""
        # Could use simple linear regression or another model
        # from sklearn.linear_model import Ridge
        # self.meta_model = Ridge()
        # self.meta_model.fit(base_predictions, targets)
        pass
    
    def predict(self, base_predictions: np.ndarray) -> np.ndarray:
        """Generate ensemble predictions using meta-model."""
        if self.meta_model is None:
            raise RuntimeError("Meta-model not trained")
        # return self.meta_model.predict(base_predictions)
        pass
