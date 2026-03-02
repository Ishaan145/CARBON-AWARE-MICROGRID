# API Usage Examples

## Starting the API

```bash
# Development mode (auto-reload on code changes)
uvicorn api.main:app --reload --port 8000

# Production mode
uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Visit `http://localhost:8000/docs` for interactive API documentation.

---

## Example 1: Real-Time Prediction

### Python

```python
import requests
from datetime import datetime

# Prepare request
url = "http://localhost:8000/predict/realtime"

request_data = {
    "current_reading": {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "solar_power": 3.5,      # kW
        "load": 2.1,             # kW
        "battery_soc": 65.0,     # %
        "temperature": 28.0,      # Celsius
        "irradiance": 650.0,      # W/m²
        "cloud_cover": 20.0,      # %
        "co2_intensity": 750.0    # gCO2/kWh
    },
    "horizon": 96  # 24 hours at 15-min intervals
}

# Make request
response = requests.post(url, json=request_data)
result = response.json()

if result['success']:
    forecast = result['forecast']
    
    print(f"Forecast horizon: {forecast['horizon']} steps ({forecast['horizon']*15/60} hours)")
    print(f"\nFirst 5 predictions:")
    for i in range(5):
        print(f"  Step {i+1}:")
        print(f"    Lower bound (10%): {forecast['q10'][i]:.2f} kW")
        print(f"    Median:            {forecast['q50'][i]:.2f} kW")
        print(f"    Upper bound (90%): {forecast['q90'][i]:.2f} kW")
else:
    print(f"Error: {result['error']}")
```

### cURL

```bash
curl -X POST "http://localhost:8000/predict/realtime" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

---

## Example 2: Batch Prediction

```python
import requests
import pandas as pd
from datetime import datetime, timedelta

# Create historical data
timestamps = pd.date_range(start='2024-02-14 00:00:00', periods=100, freq='15min')

batch_data = []
for ts in timestamps:
    batch_data.append({
        "timestamp": ts.isoformat() + "Z",
        "solar_power": 3.0 + 0.5 * (ts.hour - 12)**2 / 144,  # Peak at noon
        "load": 2.0 + 0.3 * abs(ts.hour - 18) / 18,  # Peak at 6pm
        "battery_soc": 60.0,
        "temperature": 25.0,
        "irradiance": 600.0,
        "cloud_cover": 15.0,
        "co2_intensity": 800.0
    })

# Make request
url = "http://localhost:8000/predict/batch"
request_data = {
    "data": batch_data,
    "horizon": 96
}

response = requests.post(url, json=request_data)
result = response.json()

if result['success']:
    print(f"Received {len(result['forecasts'])} forecasts")
else:
    print(f"Error: {result['error']}")
```

---

## Example 3: Check Model Status

```python
import requests

url = "http://localhost:8000/models/status"
response = requests.get(url)
status = response.json()

print("Loaded Models:")
for model_name, model_info in status['models'].items():
    print(f"\n{model_name.upper()}:")
    print(f"  Version: {model_info['version']}")
    print(f"  Type: {model_info['model_type']}")
    print(f"  Loaded: {model_info['is_loaded']}")

print("\n\nEnsemble Weights:")
for quantile, weights in status['ensemble_weights'].items():
    print(f"\n{quantile.upper()}:")
    for model, weight in weights.items():
        print(f"  {model}: {weight:.2f}")
```

---

## Example 4: MPC Optimization

```python
import requests
from datetime import datetime

# First get forecast
forecast_response = requests.post(
    "http://localhost:8000/predict/realtime",
    json={
        "current_reading": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "solar_power": 4.0,
            "load": 2.5,
            "battery_soc": 70.0,
            "temperature": 30.0,
            "irradiance": 700.0,
            "cloud_cover": 10.0
        },
        "horizon": 96
    }
)

forecast = forecast_response.json()['forecast']

# Run optimization
opt_response = requests.post(
    "http://localhost:8000/optimize/mpc",
    json={
        "forecast": forecast,
        "current_soc": 70.0,
        "battery_capacity_kwh": 10.0
    }
)

opt_result = opt_response.json()

if opt_result['success']:
    print("Optimization Results:")
    print(f"Total Carbon: {opt_result['total_carbon_kg']:.2f} kg CO2")
    
    print("\nFirst 5 control decisions:")
    for i, decision in enumerate(opt_result['decisions'][:5]):
        print(f"\nStep {i+1}:")
        print(f"  Charge Power: {decision['charge_power_kw']:.2f} kW")
        print(f"  Grid Import: {decision['grid_import_kw']:.2f} kW")
        print(f"  Expected SOC: {decision['expected_soc']:.1f}%")
```

---

## Example 5: Health Check

```python
import requests

response = requests.get("http://localhost:8000/health")
health = response.json()

print(f"Status: {health['status']}")
print(f"Version: {health['version']}")
print(f"Models Loaded: {health['models_loaded']}")
print(f"Timestamp: {health['timestamp']}")
```

---

## Example 6: Hot Reload Models

After updating model files in `models/binaries/`:

```python
import requests

response = requests.post("http://localhost:8000/models/reload")
result = response.json()

if result['success']:
    print("✓ Models reloaded successfully")
else:
    print(f"✗ Failed to reload: {result['message']}")
```

---

## Example 7: Visualizing Forecasts

```python
import requests
import matplotlib.pyplot as plt
from datetime import datetime

# Get forecast
response = requests.post(
    "http://localhost:8000/predict/realtime",
    json={
        "current_reading": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "solar_power": 3.0,
            "load": 2.0,
            "battery_soc": 60.0,
            "temperature": 25.0,
            "irradiance": 600.0,
            "cloud_cover": 20.0
        },
        "horizon": 96
    }
)

forecast = response.json()['forecast']

# Plot
plt.figure(figsize=(12, 6))
time_points = range(len(forecast['q50']))

plt.fill_between(time_points, forecast['q10'], forecast['q90'], 
                 alpha=0.3, label='80% Confidence Interval')
plt.plot(time_points, forecast['q50'], 'b-', linewidth=2, label='Median Forecast')

plt.xlabel('Time Steps (15-min intervals)')
plt.ylabel('Load (kW)')
plt.title('24-Hour Load Forecast with Uncertainty')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('forecast.png', dpi=150)
print("Forecast plot saved to forecast.png")
```

---

## Example 8: Streaming Predictions

For continuous monitoring:

```python
import requests
import time
from datetime import datetime

def get_latest_reading():
    """Simulate getting latest sensor readings."""
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "solar_power": 3.2,
        "load": 2.1,
        "battery_soc": 65.0,
        "temperature": 27.0,
        "irradiance": 630.0,
        "cloud_cover": 18.0,
        "co2_intensity": 760.0
    }

def run_continuous_forecasting(interval_seconds=900):  # Every 15 minutes
    """Run forecasting in a loop."""
    url = "http://localhost:8000/predict/realtime"
    
    while True:
        try:
            reading = get_latest_reading()
            
            response = requests.post(url, json={
                "current_reading": reading,
                "horizon": 96
            })
            
            if response.json()['success']:
                forecast = response.json()['forecast']
                print(f"\n[{datetime.now()}] New forecast generated")
                print(f"Next hour median: {sum(forecast['q50'][:4])/4:.2f} kW")
            else:
                print(f"Error: {response.json()['error']}")
                
        except Exception as e:
            print(f"Request failed: {e}")
        
        time.sleep(interval_seconds)

# Run
# run_continuous_forecasting()
```

---

## Error Handling

```python
import requests

def safe_predict(reading, max_retries=3):
    """Make prediction with retry logic."""
    url = "http://localhost:8000/predict/realtime"
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                url,
                json={"current_reading": reading, "horizon": 96},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result['success']:
                    return result['forecast']
                else:
                    print(f"Prediction failed: {result['error']}")
            else:
                print(f"HTTP {response.status_code}: {response.text}")
                
        except requests.exceptions.Timeout:
            print(f"Attempt {attempt+1}: Request timed out")
        except requests.exceptions.ConnectionError:
            print(f"Attempt {attempt+1}: Connection failed")
        except Exception as e:
            print(f"Attempt {attempt+1}: {e}")
        
        if attempt < max_retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
    
    return None
```
