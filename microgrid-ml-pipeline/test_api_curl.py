#!/usr/bin/env python3
"""Simple API test using curl."""

import subprocess
import time
import sys
from pathlib import Path

def run_curl(url, method="GET", data=None):
    """Run a curl command and return JSON response."""
    cmd = ["curl", "-s", "-X", method, url]
    if data:
        cmd.extend(["-H", "Content-Type: application/json", "-d", data])
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout

def main():
    """Run API tests."""
    base_url = "http://localhost:8000"
    
    print("\n" + "="*60)
    print("MICROGRID ML PIPELINE - API TEST (curl)")
    print("="*60 + "\n")
    
    # Wait a bit for server to be ready
    print("Waiting for server to be ready...")
    time.sleep(2)
    
    # Test 1: Root
    print("[1/4] Testing GET /")
    resp = run_curl(f"{base_url}/")
    print(f"Response: {resp}\n")
    
    # Test 2: Health
    print("[2/4] Testing GET /health")
    resp = run_curl(f"{base_url}/health")
    print(f"Response: {resp}\n")
    
    # Test 3: Models status
    print("[3/4] Testing GET /models/status")
    resp = run_curl(f"{base_url}/models/status")
    if len(resp) < 500:
        print(f"Response: {resp}\n")
    else:
        print(f"Response (first 500 chars): {resp[:500]}...\n")
    
    # Test 4: Prediction
    print("[4/4] Testing POST /predict/realtime")
    payload = '''{
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
    }'''
    
    resp = run_curl(f"{base_url}/predict/realtime", "POST", payload)
    if len(resp) < 500:
        print(f"Response: {resp}\n")
    else:
        print(f"Response (first 500 chars): {resp[:500]}...\n")
    
    print("="*60)
    print("✓ API TESTS COMPLETED!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
