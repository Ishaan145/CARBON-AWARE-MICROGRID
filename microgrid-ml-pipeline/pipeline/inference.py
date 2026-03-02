"""
Inference Orchestrator

Main pipeline that coordinates feature engineering, model inference,
and ensemble blending to produce final forecasts.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any
from pathlib import Path
import yaml

from models.adapters import ModelAdapterFactory
from pipeline.feature_engineering import FeatureEngineer
from pipeline.ensemble import QuantileEnsemble


class InferencePipeline:
    """
    End-to-end inference pipeline for microgrid forecasting.
    
    Coordinates:
    1. Feature engineering
    2. Model loading
    3. Multi-model inference
    4. Ensemble blending
    """
    
    def __init__(self, config_path: str):
        """
        Initialize inference pipeline.
        
        Args:
            config_path: Path to settings.yaml configuration file
        """
        self.config = self._load_config(config_path)
        
        # Initialize components
        self.feature_engineer = FeatureEngineer(self.config['features'])
        self.ensemble = QuantileEnsemble(self.config['ensemble'].get('weights_path'))
        
        # Model adapters
        self.models = {}
        self._load_models()
        
        print("✓ Inference pipeline initialized")
    
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file."""
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        return config
    
    def _load_models(self):
        """Load all configured models."""
        model_configs = self.config['models']
        
        for model_type in ['deepar', 'lstm', 'xgboost']:
            if model_type in model_configs:
                model_config = model_configs[model_type]
                model_path = model_config['path']
                
                try:
                    # Create adapter
                    adapter = ModelAdapterFactory.create_adapter(
                        model_type=model_type,
                        model_path=model_path,
                        config=model_config
                    )
                    
                    # Load model
                    adapter.load_model()
                    
                    self.models[model_type] = adapter
                    print(f"✓ Loaded {model_type} model")
                    
                except Exception as e:
                    print(f"⚠️  Failed to load {model_type} model: {e}")
    
    def predict_realtime(self,
                        current_data: Dict[str, Any],
                        horizon: int = 96) -> Dict[str, np.ndarray]:
        """
        Generate real-time forecast from current sensor readings.
        
        Args:
            current_data: Dictionary with keys:
                - timestamp: datetime or string
                - solar_power: float
                - load: float
                - battery_soc: float
                - temperature: float
                - irradiance: float
                - cloud_cover: float
                - co2_intensity: float (optional)
            horizon: Forecast horizon (default 96 = 24 hours)
        
        Returns:
            Dictionary with quantile predictions:
                - 'q10': Lower bound (10th percentile)
                - 'q50': Median forecast
                - 'q90': Upper bound (90th percentile)
                - 'horizon': Number of steps
                - 'interval_minutes': 15
        """
        # Convert to DataFrame for feature engineering
        df = pd.DataFrame([current_data])
        
        # Engineer features
        features, feature_names = self.feature_engineer.engineer_features(
            df, target_col='load', fit=False
        )
        
        # Prepare sequence for sequential models (DeepAR, LSTM)
        # For real-time, we'd need historical context
        # Here we'll use a simplified approach
        
        # Get predictions from each model
        all_predictions = {}
        
        # DeepAR prediction
        if 'deepar' in self.models:
            try:
                # DeepAR expects sequence input
                # For single point prediction, we'd need context
                # This is simplified - in production, maintain context buffer
                deepar_pred = self.models['deepar'].predict(features[-1:, 0:1])
                all_predictions['deepar'] = deepar_pred
            except Exception as e:
                print(f"⚠️  DeepAR prediction failed: {e}")
        
        # LSTM prediction
        if 'lstm' in self.models:
            try:
                lstm_pred = self.models['lstm'].predict(features[-1:, 0:1])
                all_predictions['lstm'] = lstm_pred
            except Exception as e:
                print(f"⚠️  LSTM prediction failed: {e}")
        
        # XGBoost prediction
        if 'xgboost' in self.models:
            try:
                # XGBoost uses tabular features
                xgb_pred = self.models['xgboost'].predict(features[-1:])
                all_predictions['xgboost'] = xgb_pred
            except Exception as e:
                print(f"⚠️  XGBoost prediction failed: {e}")
        
        # Ensemble predictions
        if all_predictions:
            final_predictions = self.ensemble.blend_quantiles(all_predictions)
            final_predictions['horizon'] = horizon
            final_predictions['interval_minutes'] = 15
            return final_predictions
        else:
            raise RuntimeError("No model predictions available")
    
    def predict_batch(self,
                     historical_data: pd.DataFrame,
                     horizon: int = 96) -> Dict[str, np.ndarray]:
        """
        Generate batch forecasts from historical data.
        
        Args:
            historical_data: DataFrame with columns:
                - timestamp
                - solar_power
                - load
                - battery_soc
                - temperature
                - irradiance
                - cloud_cover
                - co2_intensity (optional)
            horizon: Forecast horizon
        
        Returns:
            Dictionary with quantile predictions for each time point
        """
        # Engineer features
        features, feature_names = self.feature_engineer.engineer_features(
            historical_data, target_col='load', fit=False
        )
        
        # Prepare sequences for sequential models
        context_length = self.config['models']['deepar'].get('context_length', 96)
        sequences = self.feature_engineer.prepare_sequence(features, context_length)
        
        # Get predictions from each model
        all_predictions = {}
        
        # DeepAR - use sequences
        if 'deepar' in self.models:
            try:
                deepar_pred = self.models['deepar'].predict(sequences[:, :, 0:1])
                all_predictions['deepar'] = deepar_pred
            except Exception as e:
                print(f"⚠️  DeepAR batch prediction failed: {e}")
        
        # LSTM - use sequences
        if 'lstm' in self.models:
            try:
                lstm_pred = self.models['lstm'].predict(sequences[:, :, 0:1])
                all_predictions['lstm'] = lstm_pred
            except Exception as e:
                print(f"⚠️  LSTM batch prediction failed: {e}")
        
        # XGBoost - use tabular features
        if 'xgboost' in self.models:
            try:
                # Use features from points that have enough context
                xgb_features = features[context_length-1:]
                xgb_pred = self.models['xgboost'].predict(xgb_features)
                all_predictions['xgboost'] = xgb_pred
            except Exception as e:
                print(f"⚠️  XGBoost batch prediction failed: {e}")
        
        # Ensemble
        if all_predictions:
            final_predictions = self.ensemble.blend_quantiles(all_predictions)
            return final_predictions
        else:
            raise RuntimeError("No model predictions available")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about all loaded models."""
        info = {}
        for model_name, adapter in self.models.items():
            info[model_name] = adapter.get_info()
        return info
    
    def reload_models(self):
        """Reload all models from disk (hot reload)."""
        print("Reloading models...")
        self.models = {}
        self._load_models()
        print("✓ Models reloaded")
    
    def update_ensemble_weights(self, new_weights: Dict):
        """
        Update ensemble weights dynamically.
        
        Args:
            new_weights: Dictionary of new weights
        """
        self.ensemble.set_weights(new_weights)
        print("✓ Ensemble weights updated")
