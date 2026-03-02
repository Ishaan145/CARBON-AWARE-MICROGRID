#!/usr/bin/env python3
"""Test script for the Microgrid ML Pipeline API."""

import sys
import os
from pathlib import Path

# Set working directory and path
project_root = Path(__file__).parent
os.chdir(project_root)
sys.path.insert(0, str(project_root))

def test_pipeline():
    """Test the inference pipeline directly."""
    print("\n" + "="*60)
    print("MICROGRID ML PIPELINE - DIRECT TEST")
    print("="*60 + "\n")
    
    try:
        # Import pipeline
        from pipeline.inference import InferencePipeline
        
        print("[1/5] Testing pipeline initialization...")
        config_path = "config/settings.yaml"
        pipeline = InferencePipeline(config_path)
        print("✓ Pipeline initialized successfully\n")
        
        # Test model loading
        print("[2/5] Testing model status...")
        model_info = pipeline.get_model_info()
        for model_name, info in model_info.items():
            print(f"  ✓ {model_name}: {info.get('is_loaded', False)}")
        print()
        
        # Test ensemble weights
        print("[3/5] Testing ensemble...")
        ensemble_weights = pipeline.ensemble.get_weights()
        for model_name, weights in ensemble_weights.items():
            total_weight = sum(weights.values())
            print(f"  ✓ {model_name}: {weights} (sum={total_weight})")
        print()
        
        # Test feature engineering
        print("[4/5] Testing feature engineering...")
        import numpy as np
        import pandas as pd
        from datetime import datetime, timedelta
        
        # Create sample data with timestamp
        base_time = datetime(2024, 2, 14, 0, 0, 0)
        timestamps = pd.date_range(base_time, periods=3, freq='15min')
        
        sample_data = pd.DataFrame({
            'timestamp': timestamps,
            'solar_power': [3.5, 3.6, 3.7],
            'load': [2.1, 2.2, 2.3],
            'battery_soc': [65.0, 66.0, 67.0],
            'temperature': [28.0, 29.0, 30.0],
            'irradiance': [650.0, 700.0, 750.0],
            'cloud_cover': [20.0, 25.0, 30.0],
        })
        
        features, target = pipeline.feature_engineer.engineer_features(sample_data, target_col='load')
        print(f"  ✓ Feature engineering produced {features.shape[0]} rows x {features.shape[1]} cols")
        print()
        
        # Test real-time prediction
        print("[5/5] Testing real-time prediction...")
        current_data = {
            'solar_power': 3.5,
            'load': 2.1,
            'battery_soc': 65.0,
            'temperature': 28.0,
            'irradiance': 650.0,
            'cloud_cover': 20.0,
            'co2_intensity': 750.0
        }
        
        predictions = pipeline.predict_realtime(current_data, horizon=96)
        print(f"  ✓ Generated forecasts:")
        print(f"    - q10: {len(predictions['q10'])} values")
        print(f"    - q50: {len(predictions['q50'])} values")
        print(f"    - q90: {len(predictions['q90'])} values")
        print(f"    - Sample q50 values: {predictions['q50'][:5]}")
        print()
        
        print("="*60)
        print("✓ ALL TESTS PASSED!")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_pipeline()
    sys.exit(0 if success else 1)
