from fastapi import APIRouter
from app.api.v1.endpoints import health, datasets

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="", tags=["System"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["Datasets & Analytics"])
