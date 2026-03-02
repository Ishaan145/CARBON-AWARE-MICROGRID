"""
FastAPI Application

Main REST API for Carbon-Aware Microgrid ML Pipeline.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from api.schemas import (
    RealtimePredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    ModelsStatusResponse,
    ModelInfo,
    OptimizationRequest,
    OptimizationResponse,
    HealthCheckResponse,
    ErrorResponse,
    QuantileForecast
)
from pipeline.inference import InferencePipeline

# Initialize FastAPI app
app = FastAPI(
    title="Carbon-Aware Microgrid ML API",
    description="Production-ready ML pipeline for microgrid forecasting and optimization",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instance
pipeline = None


@app.on_event("startup")
async def startup_event():
    """Initialize pipeline on startup."""
    global pipeline
    try:
        config_path = "config/settings.yaml"
        pipeline = InferencePipeline(config_path)
        print("✓ API started successfully")
    except Exception as e:
        print(f"❌ Failed to initialize pipeline: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print("Shutting down API...")


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint."""
    return {
        "message": "Carbon-Aware Microgrid ML API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns API status and number of loaded models.
    """
    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        models_loaded=len(pipeline.models) if pipeline else 0
    )


@app.post("/predict/realtime", response_model=PredictionResponse, tags=["Prediction"])
async def predict_realtime(request: RealtimePredictionRequest):
    """
    Generate real-time forecast from current sensor readings.
    
    Returns quantile forecasts (q10, q50, q90) for the specified horizon.
    """
    try:
        # Convert request to dict
        current_data = request.current_reading.model_dump()
        
        # Get predictions
        predictions = pipeline.predict_realtime(
            current_data=current_data,
            horizon=request.horizon
        )
        
        # Create forecast object
        forecast = QuantileForecast(
            q10=predictions['q10'].tolist(),
            q50=predictions['q50'].tolist(),
            q90=predictions['q90'].tolist(),
            horizon=predictions['horizon'],
            interval_minutes=predictions['interval_minutes'],
            timestamp_start=request.current_reading.timestamp
        )
        
        # Get model versions
        model_info = pipeline.get_model_info()
        model_versions = {name: info['version'] for name, info in model_info.items()}
        
        return PredictionResponse(
            success=True,
            forecast=forecast,
            model_versions=model_versions
        )
        
    except Exception as e:
        return PredictionResponse(
            success=False,
            error=str(e)
        )


@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Prediction"])
async def predict_batch(request: BatchPredictionRequest):
    """
    Generate batch forecasts from historical data.
    
    Useful for backtesting or processing multiple time points.
    """
    try:
        import pandas as pd
        
        # Convert request data to DataFrame
        data_dicts = [reading.model_dump() for reading in request.data]
        df = pd.DataFrame(data_dicts)
        
        # Get predictions
        predictions = pipeline.predict_batch(
            historical_data=df,
            horizon=request.horizon
        )
        
        # Create forecast objects (one per input point)
        # Simplified: return single forecast for now
        forecast = QuantileForecast(
            q10=predictions['q10'][0].tolist() if predictions['q10'].ndim > 1 else predictions['q10'].tolist(),
            q50=predictions['q50'][0].tolist() if predictions['q50'].ndim > 1 else predictions['q50'].tolist(),
            q90=predictions['q90'][0].tolist() if predictions['q90'].ndim > 1 else predictions['q90'].tolist(),
            horizon=request.horizon,
            interval_minutes=15,
            timestamp_start=request.data[0].timestamp
        )
        
        return BatchPredictionResponse(
            success=True,
            forecasts=[forecast]
        )
        
    except Exception as e:
        return BatchPredictionResponse(
            success=False,
            error=str(e)
        )


@app.get("/models/status", response_model=ModelsStatusResponse, tags=["Models"])
async def get_models_status():
    """
    Get status of all loaded models.
    
    Returns model information and current ensemble weights.
    """
    try:
        model_info_dict = pipeline.get_model_info()
        
        # Convert to ModelInfo objects
        models = {}
        for name, info in model_info_dict.items():
            models[name] = ModelInfo(**info)
        
        # Get ensemble weights
        ensemble_weights = pipeline.ensemble.get_weights()
        
        return ModelsStatusResponse(
            models=models,
            ensemble_weights=ensemble_weights
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.post("/models/reload", tags=["Models"])
async def reload_models():
    """
    Hot-reload all models from disk.
    
    Useful for deploying updated models without API restart.
    """
    try:
        pipeline.reload_models()
        return {"success": True, "message": "Models reloaded successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.post("/optimize/mpc", response_model=OptimizationResponse, tags=["Optimization"])
async def optimize_mpc(request: OptimizationRequest):
    """
    Run Model Predictive Control optimization.
    
    Given forecast and current battery state, returns optimal
    battery charge/discharge decisions.
    
    **Note:** Full MPC implementation requires optimization library.
    This is a simplified placeholder.
    """
    try:
        # Placeholder MPC logic
        # Full implementation would use CVXPY or Pyomo
        
        decisions = []
        current_soc = request.current_soc
        
        # Simple rule-based logic for demonstration
        for i in range(len(request.forecast.q50)):
            timestamp = request.forecast.timestamp_start
            
            # Simple heuristic: charge when solar > load, discharge otherwise
            forecast_net = request.forecast.q50[i] - request.forecast.q10[i]
            
            if forecast_net > 0 and current_soc < 90:
                charge_power = min(3.0, forecast_net)
            elif forecast_net < 0 and current_soc > 20:
                charge_power = max(-3.0, forecast_net)
            else:
                charge_power = 0.0
            
            grid_import = max(0, -forecast_net - charge_power)
            
            decisions.append({
                "timestamp": timestamp,
                "charge_power_kw": charge_power,
                "grid_import_kw": grid_import,
                "expected_soc": current_soc,
                "co2_avoided_kg": 0.0
            })
        
        return OptimizationResponse(
            success=True,
            decisions=decisions[:10],  # Return first 10 for brevity
            total_cost=0.0,
            total_carbon_kg=0.0
        )
        
    except Exception as e:
        return OptimizationResponse(
            success=False,
            error=str(e)
        )


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(
            error="Not Found",
            detail=str(exc),
            timestamp=datetime.utcnow()
        ).model_dump(mode='json')
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal Server Error",
            detail=str(exc),
            timestamp=datetime.utcnow()
        ).model_dump(mode='json')
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
