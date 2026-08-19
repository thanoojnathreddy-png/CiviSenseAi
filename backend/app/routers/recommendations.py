from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, Any, List, Optional
from app.models.recommendation_models import AIPriorityRecommendation
from app.services.data_store import DATA_STORE

router = APIRouter(prefix="/api", tags=["AI Recommendations"])

@router.get("/recommendations", response_model=List[AIPriorityRecommendation])
def get_recommendations(
    country: Optional[str] = Query(None, description="Country filter"),
    priority_level: Optional[str] = Query(None, description="CRITICAL, HIGH, MEDIUM, LOW"),
    category: Optional[str] = Query(None, description="Category filter")
):
    recs = DATA_STORE.get_recommendations(country=country)
    if priority_level and priority_level != "All":
        recs = [r for r in recs if r.priority_level.upper() == priority_level.upper()]
    if category and category != "All":
        recs = [r for r in recs if r.category.lower() == category.lower()]
    return recs

@router.get("/recommendations/{rec_id}", response_model=AIPriorityRecommendation)
def get_recommendation_detail(rec_id: str):
    recs = DATA_STORE.get_recommendations()
    for r in recs:
        if r.recommendation_id.lower() == rec_id.lower():
            return r
    raise HTTPException(status_code=404, detail="Recommendation not found")

@router.post("/recommendations/{rec_id}/status")
def update_recommendation_status(rec_id: str, payload: Dict[str, str] = Body(...)):
    new_status = payload.get("status", "Approved for DPR")
    return {
        "recommendation_id": rec_id,
        "status": new_status,
        "updated_at": "Just now",
        "action_note": f"Status updated to '{new_status}' by Department Secretary"
    }
