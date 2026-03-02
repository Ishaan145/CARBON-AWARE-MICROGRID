#!/usr/bin/env python3
"""API test script for the Microgrid ML Pipeline."""

import sys
import time
import subprocess
from pathlib import Path
import requests
import json
from datetime import datetime

def start_server():
    """Start the FastAPI server in background."""
    print("Starting API server...")
    proc = subprocess.Popen(
        [
            sys.executable, "-c",
            "import sys; sys.path.insert(0, '.'); "
            "from uvicorn import run; from api.main import app; "
            "run(app, host='127.0.0.1', port=8001)"
        ],
        cwd=Path(__file__).parent,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(3)  # Wait for server to start
    return proc

def test_api():
    """Test the API endpoints."""
    base_url = "http://127.0.0.1:8001"
    
    print("\n" + "="*60)
    print("MICROGRID ML PIPELINE - API TEST")
    print("="*60 + "\n")
    
    # Test 1: Root endpoint
    print("[1/4] Testing root endpoint (GET /)...")
    try:
        resp = requests.get(f"{base_url}/")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert 'message' in data
        assert 'version' in data
        print(f"  ✓ Response: {data.get('message')}")
        print(f"  ✓ Status: {data.get('status')}\n")
    except Exception as e:
        print(f"  ❌ Failed: {e}\n")
        return False
    
    # Test 2: Health check
    print("[2/4] Testing health check (GET /health)...")
    try:
        resp = requests.get(f"{base_url}/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get('status') == 'healthy'
        print(f"  ✓ Status: {data.get('status')}")
        print(f"  ✓ Version: {data.get('version')}")
        print(f"  ✓ Models loaded: {data.get('models_loaded')}\n")
    except Exception as e:
        print(f"  ❌ Failed: {e}\n")
        return False
    
    # Test 3: Models status
    print("[3/4] Testing models status (GET /models/status)...")
    try:
        resp = requests.get(f"{base_url}/models/status")
        assert resp.status_code == 200
        data = resp.json()
        models = data.get('models', {})
        for model_name, info in models.items():
            is_loaded = info.get('is_loaded', False)
            print(f"  ✓ {model_name}: {is_loaded}")
        print()
    except Exception as e:
        print(f"  ❌ Failed: {e}\n")
        return False
    
    # Test 4: Real-time prediction
    print("[4/4] Testing real-time prediction (POST /predict/realtime)...")
    try:
        payload = {
            "current_reading": {
                "timestamp": "2024-02-14T12:00:00Z",
                "solar_power": 3.5,
                "load": 2.1,
                "battery_soc": 65.0,
                "temperature": 28.0,
                "irradiance": 650.0,
                "cloud_cover": 20.0,
                "co2_intensity": 750.0
            },
            "horizon": 96
        }
        
        resp = requests.post(
            f"{base_url}/predict/realtime",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data.get('success', False)
        
        forecast = data.get('forecast', {})
        print(f"  ✓ Forecast generated:")
        print(f"    - Horizon: {forecast.get('horizon')} steps")
        print(f"    - Interval: {forecast.get('interval_minutes')} minutes")
        print(f"    - q50 length: {len(forecast.get('q50', []))}")
        print()
        
    except Exception as e:
        print(f"  ❌ Failed: {e}\n")
        return False
    
    print("="*60)
    print("✓ ALL API TESTS PASSED!")
    print("="*60 + "\n")
    return True

if __name__ == "__main__":
    proc = None
    try:
        proc = start_server()
        success = test_api()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        if proc:
            proc.terminate()
            proc.wait(timeout=5)
