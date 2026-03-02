"""
API Schemas (Pydantic Models)

Defines request/response schemas for the REST API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class SensorReading(BaseModel):
    """Single sensor reading for real-time prediction."""
    timestamp: datetime = Field(..., description="Timestamp of reading")
    solar_power: float = Field(..., ge=0, description="Solar power in kW")
    load: float = Field(..., ge=0, description="Load demand in kW")
    battery_soc: float = Field(..., ge=0, le=100, description="Battery state of charge (%)")
    temperature: float = Field(..., description="Temperature in Celsius")
    irradiance: float = Field(..., ge=0, description="Solar irradiance in W/m²")
    cloud_cover: float = Field(..., ge=0, le=100, description="Cloud cover percentage")
    co2_intensity: Optional[float] = Field(None, ge=0, description="Grid CO2 intensity (gCO2/kWh)")


class RealtimePredictionRequest(BaseModel):
    """Request for real-time prediction."""
    current_reading: SensorReading
    horizon: Optional[int] = Field(96, ge=1, le=192, description="Forecast horizon (15-min steps)")
    
    class Config:
        json_schema_extra = {
            "example": {
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


class QuantileForecast(BaseModel):
    """Quantile forecast output."""
    q10: List[float] = Field(..., description="10th percentile (lower bound)")
    q50: List[float] = Field(..., description="50th percentile (median)")
    q90: List[float] = Field(..., description="90th percentile (upper bound)")
    horizon: int = Field(..., description="Number of forecast steps")
    interval_minutes: int = Field(15, description="Time interval in minutes")
    timestamp_start: datetime = Field(..., description="Forecast start time")


class PredictionResponse(BaseModel):
    """Response for prediction requests."""
    success: bool
    forecast: Optional[QuantileForecast] = None
    error: Optional[str] = None
    model_versions: Optional[Dict[str, str]] = None


class BatchPredictionRequest(BaseModel):
    """Request for batch prediction."""
    data: List[SensorReading]
    horizon: Optional[int] = Field(96, ge=1, le=192)


class BatchPredictionResponse(BaseModel):
    """Response for batch prediction."""
    success: bool
    forecasts: Optional[List[QuantileForecast]] = None
    error: Optional[str] = None


class ModelInfo(BaseModel):
    """Model information."""
    model_type: str
    version: str
    is_loaded: bool
    config: Dict[str, Any]


class ModelsStatusResponse(BaseModel):
    """Response for models status endpoint."""
    models: Dict[str, ModelInfo]
    ensemble_weights: Dict[str, Dict[str, float]]


class OptimizationRequest(BaseModel):
    """Request for MPC optimization."""
    forecast: QuantileForecast
    current_soc: float = Field(..., ge=0, le=100)
    battery_capacity_kwh: float = Field(10.0, gt=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "forecast": {
                    "q10": [2.0] * 96,
                    "q50": [2.5] * 96,
                    "q90": [3.0] * 96,
                    "horizon": 96,
                    "interval_minutes": 15,
                    "timestamp_start": "2024-02-14T12:15:00Z"
                },
                "current_soc": 65.0,
                "battery_capacity_kwh": 10.0
            }
        }


class OptimizationDecision(BaseModel):
    """Battery control decision for single timestep."""
    timestamp: datetime
    charge_power_kw: float = Field(..., description="Positive=charge, negative=discharge")
    grid_import_kw: float
    expected_soc: float
    co2_avoided_kg: Optional[float] = None


class OptimizationResponse(BaseModel):
    """Response from MPC optimization."""
    success: bool
    decisions: Optional[List[OptimizationDecision]] = None
    total_cost: Optional[float] = None
    total_carbon_kg: Optional[float] = None
    error: Optional[str] = None


class HealthCheckResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: datetime
    version: str
    models_loaded: int


class ErrorResponse(BaseModel):
    """Error response."""
    error: str
    detail: Optional[str] = None
    timestamp: datetime
