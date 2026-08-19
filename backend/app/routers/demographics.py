from fastapi import APIRouter, Query
from typing import Dict, Any, List, Optional
from app.services.data_store import DATA_STORE

router = APIRouter(prefix="/api", tags=["Demographics & Infrastructure"])

@router.get("/demographics", response_model=List[Dict[str, Any]])
def get_demographics(country: Optional[str] = Query(None)):
    demos = list(DATA_STORE.demographics.values())
    if country and country != "All":
        demos = [d for d in demos if d.get("country", "").lower() == country.lower()]
    return demos

@router.get("/infrastructure", response_model=List[Dict[str, Any]])
def get_infrastructure(country: Optional[str] = Query(None)):
    infras = list(DATA_STORE.infrastructure.values())
    if country and country != "All":
        infras = [i for i in infras if i.get("country", "").lower() == country.lower()]
    return infras

@router.get("/government-projects", response_model=List[Dict[str, Any]])
def get_government_projects(country: Optional[str] = Query(None), district: Optional[str] = Query(None)):
    projs = DATA_STORE.projects
    if country and country != "All":
        projs = [p for p in projs if p.get("country", "").lower() == country.lower()]
    if district and district != "All":
        projs = [p for p in projs if p.get("district", "").lower() == district.lower()]
    return projs
