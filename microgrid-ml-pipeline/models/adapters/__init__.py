"""
Model Adapters Package

Provides consistent interface for loading and using different model types.
"""

from .base import BaseModelAdapter, ModelAdapterFactory
from .deepar_adapter import DeepARAdapter
from .lstm_adapter import LSTMAdapter
from .xgboost_adapter import XGBoostAdapter

__all__ = [
    'BaseModelAdapter',
    'ModelAdapterFactory',
    'DeepARAdapter',
    'LSTMAdapter',
    'XGBoostAdapter'
]

# Adapters are auto-registered when imported
# Available types: deepar, lstm, xgboost
