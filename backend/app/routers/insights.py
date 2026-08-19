from fastapi import APIRouter, Query
from typing import Dict, Any, List, Optional
from app.models.domain_models import AnalyticalInsight
from app.services.data_store import DATA_STORE

router = APIRouter(prefix="/api/insights", tags=["Analytical Civic Intelligence"])

@router.get("", response_model=List[AnalyticalInsight])
def get_analytical_insights(country: Optional[str] = Query(None, description="Country filter")):
    return DATA_STORE.get_insights(country=country)
