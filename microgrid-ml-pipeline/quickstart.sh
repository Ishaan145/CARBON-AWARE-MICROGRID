#!/bin/bash
# Quick Start Script for Carbon-Aware Microgrid ML Pipeline

echo "======================================"
echo "Carbon-Aware Microgrid ML Pipeline"
echo "======================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt -q

echo ""
echo "✅ Setup complete!"
echo ""
echo "======================================"
echo "Available Commands:"
echo "======================================"
echo ""
echo "1. Start API (Development):"
echo "   uvicorn api.main:app --reload --port 8000"
echo ""
echo "2. Start API (Production):"
echo "   uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4"
echo ""
echo "3. Run Tests:"
echo "   pytest tests/ -v"
echo ""
echo "4. Docker Build:"
echo "   docker build -t microgrid-ml-pipeline ."
echo ""
echo "5. Docker Run:"
echo "   docker run -p 8000:8000 microgrid-ml-pipeline"
echo ""
echo "======================================"
echo "API Documentation:"
echo "======================================"
echo ""
echo "Once running, visit:"
echo "  - http://localhost:8000/docs (Swagger UI)"
echo "  - http://localhost:8000/redoc (ReDoc)"
echo ""
echo "======================================"
echo "Model Replacement:"
echo "======================================"
echo ""
echo "Replace placeholder models in models/binaries/ with your trained models:"
echo "  - deepar_model.pt (PyTorch checkpoint)"
echo "  - lstm_model.pt (PyTorch checkpoint)"
echo "  - xgboost_model.pkl or .json (XGBoost model)"
echo ""
echo "Then restart the API or call POST /models/reload"
echo ""
