# Carbon-Aware Microgrid ML Pipeline

## Overview
Production-ready backend pipeline that integrates DeepAR, LSTM, and XGBoost models for carbon-aware microgrid optimization.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Input Data Sources                       │
│  • 15-min sensor data (solar, load, battery SOC)            │
│  • Weather API (temperature, irradiance, cloud)             │
│  • Grid CO₂ intensity                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Feature Engineering Pipeline                    │
│  • Lag features (1-48 periods)                              │
│  • Rolling statistics                                       │
│  • Cyclic time encodings (hour/day sin/cos)                │
│  • Weather normalization                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Model Inference Layer                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   DeepAR     │  │     LSTM     │  │   XGBoost    │     │
│  │ Probabilistic│  │   Residual   │  │   Quantile   │     │
│  │  Forecaster  │  │  Correction  │  │  Regression  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Ensemble Layer                              │
│  • Weighted quantile blending                               │
│  • Output: q10, q50, q90 forecasts (96-step horizon)       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Carbon Optimization Engine (MPC)                  │
│  • Risk-aware model predictive control                      │
│  • Battery charge/discharge optimization                    │
│  • Carbon intensity minimization                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    REST API Outputs                          │
│  • Forecasts with uncertainty bounds                        │
│  • Optimization decisions                                   │
│  • Model performance metrics                                │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
microgrid-ml-pipeline/
├── models/
│   ├── binaries/              # Placeholder model files (.pt, .pkl)
│   │   ├── deepar_model.pt
│   │   ├── lstm_model.pt
│   │   └── xgboost_model.pkl
│   ├── adapters/              # Model wrapper interfaces
│   │   ├── __init__.py
│   │   ├── base.py           # Abstract base adapter
│   │   ├── deepar_adapter.py
│   │   ├── lstm_adapter.py
│   │   └── xgboost_adapter.py
│   └── model_loader.py       # Model loading & versioning
├── pipeline/
│   ├── __init__.py
│   ├── feature_engineering.py # Feature transformation
│   ├── ensemble.py           # Quantile blending logic
│   └── inference.py          # Main orchestration
├── optimization/
│   ├── __init__.py
│   └── mpc_controller.py     # MPC optimization (stub/full)
├── api/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── routes.py            # API endpoints
│   └── schemas.py           # Pydantic models
├── data/
│   ├── __init__.py
│   ├── data_loader.py       # Data ingestion
│   └── synthetic_generator.py # Mock data for testing
├── config/
│   ├── settings.yaml        # Configuration
│   └── ensemble_weights.yaml # Model ensemble weights
├── tests/
│   ├── test_pipeline.py
│   ├── test_models.py
│   └── test_api.py
├── requirements.txt
├── Dockerfile
└── README.md
```

## Quick Start

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Edit `config/settings.yaml` to configure:
- Model paths
- Feature engineering parameters
- API settings
- Data sources

### Running the API

```bash
# Development mode
uvicorn api.main:app --reload --port 8000

# Production mode
uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker

```bash
# Build image
docker build -t microgrid-ml-pipeline .

# Run container
docker run -p 8000:8000 microgrid-ml-pipeline
```

## API Endpoints

### Prediction Endpoints

**POST /predict/realtime**
- Real-time single prediction
- Input: Current sensor readings
- Output: 96-step forecast with quantiles

**POST /predict/batch**
- Batch predictions
- Input: Array of historical data
- Output: Forecasts for each time point

### Model Management

**GET /models/status**
- Check model health and versions

**POST /models/reload**
- Hot-reload models without restart

### Optimization

**POST /optimize/mpc**
- Run MPC optimization
- Input: Forecast quantiles
- Output: Battery control decisions

## Example Usage

```python
import requests

# Real-time prediction
response = requests.post(
    "http://localhost:8000/predict/realtime",
    json={
        "timestamp": "2024-02-14T12:00:00Z",
        "solar_power": 3.5,
        "load": 2.1,
        "battery_soc": 65.0,
        "temperature": 28.0,
        "irradiance": 650.0,
        "cloud_cover": 20.0
    }
)

forecast = response.json()
print(f"Median forecast: {forecast['q50']}")
print(f"Lower bound (10%): {forecast['q10']}")
print(f"Upper bound (90%): {forecast['q90']}")
```

## Model Integration

### Adding Your Trained Models

1. **Export your models:**
   ```python
   # PyTorch models
   torch.save(model.state_dict(), 'models/binaries/deepar_model.pt')
   
   # XGBoost models
   model.save_model('models/binaries/xgboost_model.json')
   ```

2. **Update configuration:**
   ```yaml
   # config/settings.yaml
   models:
     deepar:
       path: models/binaries/deepar_model.pt
       version: "1.0.0"
     lstm:
       path: models/binaries/lstm_model.pt
       version: "1.0.0"
     xgboost:
       path: models/binaries/xgboost_model.json
       version: "1.0.0"
   ```

3. **Restart API** - models auto-load on startup

## Performance & Monitoring

- **Latency**: Target <100ms per prediction
- **Throughput**: ~100 requests/second
- **Model drift**: Automatic PSI monitoring
- **Logging**: Structured JSON logs to stdout

## Testing

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest --cov=. tests/

# Run specific test
pytest tests/test_pipeline.py -v
```

## Deployment

### Environment Variables

```bash
export MODEL_PATH=/app/models/binaries
export API_PORT=8000
export LOG_LEVEL=INFO
export WORKERS=4
```

### Production Checklist

- [ ] Set ensemble weights in `config/ensemble_weights.yaml`
- [ ] Configure database connection (if applicable)
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Enable HTTPS/TLS
- [ ] Configure rate limiting
- [ ] Set up model versioning
- [ ] Enable drift detection alerts

## Contributing

When adding new model types:

1. Create adapter in `models/adapters/`
2. Inherit from `BaseModelAdapter`
3. Implement `predict()` method
4. Update `ensemble.py` blending logic
5. Add tests

## License

MIT

## Support

For issues or questions, contact the ML team.
