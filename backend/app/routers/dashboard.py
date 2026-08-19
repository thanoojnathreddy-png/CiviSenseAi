from fastapi import APIRouter, Query
from typing import Dict, Any, List, Optional
from app.models.recommendation_models import ExecutiveStats, HotspotPoint
from app.services.data_store import DATA_STORE

router = APIRouter(prefix="/api", tags=["Policymaker Dashboard"])

@router.get("/stats", response_model=ExecutiveStats)
def get_executive_stats(country: Optional[str] = Query(None, description="Country filter (e.g. India, Brazil, All)")):
    return DATA_STORE.get_stats(country=country)

@router.get("/hotspots", response_model=List[HotspotPoint])
def get_demand_hotspots(country: Optional[str] = Query(None, description="Country filter")):
    return DATA_STORE.get_hotspots(country=country)
