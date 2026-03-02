"""
Feature Engineering Pipeline

Transforms raw sensor data into features suitable for ML models.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime


class FeatureEngineer:
    """
    Feature engineering for time-series microgrid data.
    
    Handles:
    - Lag features
    - Rolling statistics
    - Cyclic time encodings
    - Weather normalization
    """
    
    def __init__(self, config: Dict):
        """
        Initialize feature engineer.
        
        Args:
            config: Configuration dictionary with keys:
                - lag_periods: List of lag periods to create
                - rolling_windows: List of rolling window sizes
                - cyclic_encodings: List of cyclic features to encode
        """
        self.lag_periods = config.get('lag_periods', [1, 2, 4, 12, 24, 48, 96])
        self.rolling_windows = config.get('rolling_windows', [4, 12, 24, 96])
        self.cyclic_encodings = config.get('cyclic_encodings', 
                                           ['hour_of_day', 'day_of_week'])
        self.normalization = config.get('normalization', 'standard')
        
        # Statistics for normalization (learned from training data)
        self.feature_stats = {}
        
    def create_lag_features(self, 
                           series: np.ndarray, 
                           lag_periods: Optional[List[int]] = None) -> np.ndarray:
        """
        Create lag features from time series.
        
        Args:
            series: Time series array of shape (n_timesteps,)
            lag_periods: List of lag periods (default: self.lag_periods)
        
        Returns:
            Array of shape (n_timesteps, n_lags)
        """
        if lag_periods is None:
            lag_periods = self.lag_periods
        
        n_timesteps = len(series)
        lags = np.zeros((n_timesteps, len(lag_periods)))
        
        for i, lag in enumerate(lag_periods):
            lags[:, i] = np.roll(series, lag)
            # Set initial values to 0 (or could use forward fill)
            lags[:lag, i] = 0
        
        return lags
    
    def create_rolling_features(self,
                               series: np.ndarray,
                               windows: Optional[List[int]] = None) -> Dict[str, np.ndarray]:
        """
        Create rolling statistics features.
        
        Args:
            series: Time series array
            windows: List of window sizes
        
        Returns:
            Dictionary with 'mean' and 'std' arrays
        """
        if windows is None:
            windows = self.rolling_windows
        
        n_timesteps = len(series)
        rolling_means = np.zeros((n_timesteps, len(windows)))
        rolling_stds = np.zeros((n_timesteps, len(windows)))
        
        # Convert to pandas for easier rolling operations
        s = pd.Series(series)
        
        for i, window in enumerate(windows):
            rolling_means[:, i] = s.rolling(window=window, min_periods=1).mean().values
            rolling_stds[:, i] = s.rolling(window=window, min_periods=1).std().fillna(0).values
        
        return {
            'mean': rolling_means,
            'std': rolling_stds
        }
    
    def create_cyclic_features(self, 
                              timestamps) -> Dict[str, np.ndarray]:
        """
        Create cyclic encodings for time features.
        
        Args:
            timestamps: Pandas DatetimeIndex, Series, or compatible object
        
        Returns:
            Dictionary of cyclic features (sin/cos pairs)
        """
        # Ensure we have a DatetimeIndex
        if isinstance(timestamps, pd.Series):
            timestamps = timestamps.dt
        elif isinstance(timestamps, pd.DatetimeIndex):
            timestamps = timestamps
        else:
            timestamps = pd.DatetimeIndex(timestamps)
        
        features = {}
        
        if 'hour_of_day' in self.cyclic_encodings:
            hour = timestamps.hour + timestamps.minute / 60.0
            features['hour_sin'] = np.sin(2 * np.pi * hour / 24.0)
            features['hour_cos'] = np.cos(2 * np.pi * hour / 24.0)
        
        if 'day_of_week' in self.cyclic_encodings:
            day = timestamps.dayofweek
            features['day_sin'] = np.sin(2 * np.pi * day / 7.0)
            features['day_cos'] = np.cos(2 * np.pi * day / 7.0)
        
        if 'day_of_month' in self.cyclic_encodings:
            day = timestamps.day
            features['month_sin'] = np.sin(2 * np.pi * day / 31.0)
            features['month_cos'] = np.cos(2 * np.pi * day / 31.0)
        
        return features
    
    def create_calendar_features(self, timestamps) -> Dict[str, np.ndarray]:
        """
        Create calendar-based features.
        
        Args:
            timestamps: Pandas DatetimeIndex, Series, or compatible object
        
        Returns:
            Dictionary of calendar features
        """
        # Ensure we have a DatetimeIndex or accessor
        if isinstance(timestamps, pd.Series):
            dt_accessor = timestamps.dt
        elif isinstance(timestamps, pd.DatetimeIndex):
            dt_accessor = timestamps
        else:
            dt_accessor = pd.DatetimeIndex(timestamps)
        
        features = {}
        
        # Weekend indicator
        features['weekend'] = (dt_accessor.dayofweek >= 5).astype(int)
        
        # Hour of day (for direct use)
        features['hour'] = dt_accessor.hour
        
        # Day of week (for direct use)
        features['dayofweek'] = dt_accessor.dayofweek
        
        return features
    
    def normalize_features(self, features: np.ndarray, 
                          feature_name: str,
                          fit: bool = False) -> np.ndarray:
        """
        Normalize features using specified method.
        
        Args:
            features: Feature array to normalize
            feature_name: Name for tracking statistics
            fit: If True, compute and store statistics
        
        Returns:
            Normalized features
        """
        if self.normalization == 'none':
            return features
        
        if fit:
            if self.normalization == 'standard':
                mean = np.mean(features)
                std = np.std(features)
                std = std if std > 0 else 1.0
                self.feature_stats[feature_name] = {'mean': mean, 'std': std}
            elif self.normalization == 'minmax':
                min_val = np.min(features)
                max_val = np.max(features)
                range_val = max_val - min_val
                range_val = range_val if range_val > 0 else 1.0
                self.feature_stats[feature_name] = {'min': min_val, 'range': range_val}
        
        # Apply normalization
        if feature_name not in self.feature_stats:
            # If not fitted, return as-is (or could raise error)
            return features
        
        stats = self.feature_stats[feature_name]
        
        if self.normalization == 'standard':
            return (features - stats['mean']) / stats['std']
        elif self.normalization == 'minmax':
            return (features - stats['min']) / stats['range']
        
        return features
    
    def engineer_features(self,
                         data: pd.DataFrame,
                         target_col: str = 'load',
                         fit: bool = False) -> Tuple[np.ndarray, List[str]]:
        """
        Create complete feature set from raw data.
        
        Args:
            data: DataFrame with columns:
                - timestamp: datetime
                - solar_power: float
                - load: float
                - battery_soc: float
                - temperature: float
                - irradiance: float
                - cloud_cover: float
                - co2_intensity: float (optional)
            target_col: Column to use as prediction target
            fit: If True, compute normalization statistics
        
        Returns:
            Tuple of (feature_array, feature_names)
        """
        if 'timestamp' in data.columns:
            timestamps = pd.to_datetime(data['timestamp'])
        else:
            timestamps = data.index
        
        feature_dict = {}
        feature_names = []
        
        # 1. Lag features for target
        target = data[target_col].values
        lags = self.create_lag_features(target)
        for i, lag in enumerate(self.lag_periods):
            feature_dict[f'lag_{lag}'] = lags[:, i]
            feature_names.append(f'lag_{lag}')
        
        # 2. Rolling statistics for target
        rolling = self.create_rolling_features(target)
        for i, window in enumerate(self.rolling_windows):
            feature_dict[f'rolling_mean_{window}'] = rolling['mean'][:, i]
            feature_dict[f'rolling_std_{window}'] = rolling['std'][:, i]
            feature_names.append(f'rolling_mean_{window}')
            feature_names.append(f'rolling_std_{window}')
        
        # 3. Cyclic time features
        cyclic = self.create_cyclic_features(timestamps)
        for name, values in cyclic.items():
            feature_dict[name] = values
            feature_names.append(name)
        
        # 4. Calendar features
        calendar = self.create_calendar_features(timestamps)
        for name, values in calendar.items():
            feature_dict[name] = values
            feature_names.append(name)
        
        # 5. Weather features (if available)
        weather_cols = ['temperature', 'irradiance', 'cloud_cover']
        for col in weather_cols:
            if col in data.columns:
                values = data[col].values
                if fit:
                    values = self.normalize_features(values, col, fit=True)
                else:
                    values = self.normalize_features(values, col, fit=False)
                feature_dict[col] = values
                feature_names.append(col)
        
        # 6. Other features
        if 'co2_intensity' in data.columns:
            values = data['co2_intensity'].values
            if fit:
                values = self.normalize_features(values, 'co2_intensity', fit=True)
            else:
                values = self.normalize_features(values, 'co2_intensity', fit=False)
            feature_dict['co2_intensity'] = values
            feature_names.append('co2_intensity')
        
        # Combine all features into array
        feature_array = np.column_stack([feature_dict[name] for name in feature_names])
        
        return feature_array, feature_names
    
    def prepare_sequence(self,
                        features: np.ndarray,
                        context_length: int = 96) -> np.ndarray:
        """
        Prepare sequential input for LSTM/DeepAR models.
        
        Args:
            features: Feature array of shape (n_timesteps, n_features)
            context_length: Length of context window
        
        Returns:
            Array of shape (n_samples, context_length, n_features)
        """
        n_timesteps, n_features = features.shape
        n_samples = n_timesteps - context_length + 1
        
        sequences = np.zeros((n_samples, context_length, n_features))
        
        for i in range(n_samples):
            sequences[i] = features[i:i+context_length]
        
        return sequences
    
    def get_feature_importance_names(self) -> List[str]:
        """Get list of all feature names (useful for XGBoost)."""
        # Return cached feature names from last engineer_features call
        # In production, you'd want to persist this
        return []
