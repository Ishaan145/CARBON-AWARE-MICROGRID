"""
Basic tests for the ML pipeline.
"""

import pytest
import numpy as np
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.adapters import ModelAdapterFactory, DeepARAdapter, LSTMAdapter, XGBoostAdapter


class TestModelAdapters:
    """Test model adapter functionality."""
    
    def test_factory_registration(self):
        """Test that all adapters are registered."""
        adapters = ModelAdapterFactory.list_adapters()
        assert 'deepar' in adapters
        assert 'lstm' in adapters
        assert 'xgboost' in adapters
    
    def test_deepar_adapter_creation(self):
        """Test DeepAR adapter creation."""
        config = {
            'hidden_size': 64,
            'prediction_horizon': 96,
            'version': '1.0.0'
        }
        adapter = ModelAdapterFactory.create_adapter(
            'deepar',
            'models/binaries/deepar_model.pt',
            config
        )
        assert isinstance(adapter, DeepARAdapter)
        assert adapter.hidden_size == 64
    
    def test_lstm_adapter_creation(self):
        """Test LSTM adapter creation."""
        config = {
            'hidden_size': 128,
            'num_layers': 2,
            'version': '1.0.0'
        }
        adapter = ModelAdapterFactory.create_adapter(
            'lstm',
            'models/binaries/lstm_model.pt',
            config
        )
        assert isinstance(adapter, LSTMAdapter)
        assert adapter.hidden_size == 128
    
    def test_xgboost_adapter_creation(self):
        """Test XGBoost adapter creation."""
        config = {
            'quantiles': [0.1, 0.5, 0.9],
            'version': '1.0.0'
        }
        adapter = ModelAdapterFactory.create_adapter(
            'xgboost',
            'models/binaries/xgboost_model.json',
            config
        )
        assert isinstance(adapter, XGBoostAdapter)
        assert adapter.quantiles == [0.1, 0.5, 0.9]


class TestModelLoading:
    """Test model loading functionality."""
    
    def test_deepar_load_placeholder(self):
        """Test loading placeholder DeepAR model."""
        config = {'hidden_size': 64, 'prediction_horizon': 96, 'version': '1.0.0'}
        adapter = DeepARAdapter('models/binaries/deepar_model.pt', config)
        adapter.load_model()
        assert adapter.is_loaded
    
    def test_lstm_load_placeholder(self):
        """Test loading placeholder LSTM model."""
        config = {'hidden_size': 128, 'version': '1.0.0'}
        adapter = LSTMAdapter('models/binaries/lstm_model.pt', config)
        adapter.load_model()
        assert adapter.is_loaded
    
    def test_xgboost_load_placeholder(self):
        """Test loading placeholder XGBoost model."""
        config = {'quantiles': [0.1, 0.5, 0.9], 'version': '1.0.0'}
        adapter = XGBoostAdapter('models/binaries/xgboost_model.json', config)
        adapter.load_model()
        assert adapter.is_loaded


class TestModelPrediction:
    """Test model prediction functionality."""
    
    def test_deepar_prediction_shape(self):
        """Test DeepAR prediction output shape."""
        config = {'hidden_size': 64, 'prediction_horizon': 96, 'version': '1.0.0'}
        adapter = DeepARAdapter('models/binaries/deepar_model.pt', config)
        adapter.load_model()
        
        # Create dummy input (batch_size=2, context_length=96, features=1)
        features = np.random.randn(2, 96, 1)
        predictions = adapter.predict(features)
        
        assert 'q10' in predictions
        assert 'q50' in predictions
        assert 'q90' in predictions
        assert predictions['q10'].shape == (2, 96)
        assert predictions['q50'].shape == (2, 96)
        assert predictions['q90'].shape == (2, 96)
    
    def test_quantile_ordering(self):
        """Test that quantiles are properly ordered (q10 <= q50 <= q90)."""
        config = {'hidden_size': 64, 'prediction_horizon': 96, 'version': '1.0.0'}
        adapter = DeepARAdapter('models/binaries/deepar_model.pt', config)
        adapter.load_model()
        
        features = np.random.randn(1, 96, 1)
        predictions = adapter.predict(features)
        
        # Check ordering at each time point
        assert np.all(predictions['q10'] <= predictions['q50'])
        assert np.all(predictions['q50'] <= predictions['q90'])


class TestEnsemble:
    """Test ensemble functionality."""
    
    def test_ensemble_import(self):
        """Test that ensemble module can be imported."""
        from pipeline.ensemble import QuantileEnsemble
        ensemble = QuantileEnsemble()
        assert ensemble is not None
    
    def test_quantile_blending(self):
        """Test quantile blending logic."""
        from pipeline.ensemble import QuantileEnsemble
        
        ensemble = QuantileEnsemble()
        
        # Create mock predictions
        predictions = {
            'deepar': {
                'q10': np.array([1.0, 2.0]),
                'q50': np.array([1.5, 2.5]),
                'q90': np.array([2.0, 3.0])
            },
            'lstm': {
                'q10': np.array([1.1, 2.1]),
                'q50': np.array([1.6, 2.6]),
                'q90': np.array([2.1, 3.1])
            },
            'xgboost': {
                'q10': np.array([0.9, 1.9]),
                'q50': np.array([1.4, 2.4]),
                'q90': np.array([1.9, 2.9])
            }
        }
        
        blended = ensemble.blend_quantiles(predictions)
        
        assert 'q10' in blended
        assert 'q50' in blended
        assert 'q90' in blended
        assert blended['q10'].shape == (2,)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
