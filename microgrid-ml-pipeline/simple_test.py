#!/usr/bin/env python3
"""Simple API HTTP test."""

import requests
import time
import json

def test_endpoints():
    """Test API endpoints directly."""
    base_url = "http://127.0.0.1:9000"
    
    print("\n" + "="*70)
    print("MICROGRID ML PIPELINE - API HTTP TEST")
    print("="*70 + "\n")
    
    # Give server a moment
    time.sleep(1)
    
    tests = [
        {
            "name": "Root Endpoint",
            "method": "GET",
            "path": "/",
            "data": None
        },
        {
            "name": "Health Check",
            "method": "GET",
            "path": "/health",
            "data": None
        },
        {
            "name": "Models Status",
            "method": "GET",
            "path": "/models/status",
            "data": None
        },
        {
            "name": "Real-time Prediction",
            "method": "POST",
            "path": "/predict/realtime",
            "data": {
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
        }
    ]
    
    passed = 0
    failed = 0
    
    for i, test in enumerate(tests, 1):
        print(f"[{i}/{len(tests)}] {test['name']}")
        try:
            url = f"{base_url}{test['path']}"
            
            if test['method'] == 'GET':
                response = requests.get(url, timeout=5)
            else:
                response = requests.post(url, json=test['data'], timeout=5)
            
            status = "✓ PASS" if response.status_code == 200 else f"❌ FAIL (HTTP {response.status_code})"
            print(f"  Status: {status}")
            
            # Try to parse and display JSON response
            try:
                data = response.json()
                if isinstance(data, dict):
                    for key in list(data.keys())[:3]:  # Show first 3 keys
                        if key != 'forecast' and key != 'models':
                            print(f"    {key}: {str(data[key])[:60]}")
                        else:
                            print(f"    {key}: [present]")
            except:
                print(f"    Response: {response.text[:100]}")
            
            if response.status_code == 200:
                passed += 1
            else:
                failed += 1
                
        except requests.exceptions.ConnectionError:
            print(f"  ❌ FAIL: Connection refused")
            failed += 1
        except Exception as e:
            print(f"  ❌ FAIL: {str(e)[:60]}")
            failed += 1
        
        print()
    
    print("="*70)
    print(f"Results: {passed} passed, {failed} failed")
    print("="*70 + "\n")
    
    return failed == 0

if __name__ == "__main__":
    import sys
    success = test_endpoints()
    sys.exit(0 if success else 1)
