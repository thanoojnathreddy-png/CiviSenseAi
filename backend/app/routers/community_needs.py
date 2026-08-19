from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from app.models.domain_models import CommunityNeed
from app.services.data_store import DATA_STORE

router = APIRouter(prefix="/api/community-needs", tags=["Community Needs Aggregation"])

@router.get("", response_model=List[CommunityNeed])
def get_community_needs(
    country: Optional[str] = Query(None, description="Country filter"),
    category: Optional[str] = Query(None, description="Category filter"),
    priority_level: Optional[str] = Query(None, description="Priority level filter")
):
    needs = DATA_STORE.get_community_needs(country=country, category=category)
    if priority_level and priority_level != "All":
        needs = [n for n in needs if n.priority_level.upper() == priority_level.upper()]
    return needs

@router.get("/{need_id}", response_model=CommunityNeed)
def get_community_need_detail(need_id: str):
    needs = DATA_STORE.get_community_needs()
    for n in needs:
        if n.need_id.lower() == need_id.lower():
            return n
    raise HTTPException(status_code=404, detail="Community Need not found")
