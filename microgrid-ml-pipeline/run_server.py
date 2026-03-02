#!/usr/bin/env python3
"""Start the FastAPI server."""

import os
import sys
from pathlib import Path

# Set working directory to project root
project_root = Path(__file__).parent
os.chdir(project_root)
sys.path.insert(0, str(project_root))

if __name__ == "__main__":
    import uvicorn
    from api.main import app
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False  # Disable reload to avoid restart issues
    )
