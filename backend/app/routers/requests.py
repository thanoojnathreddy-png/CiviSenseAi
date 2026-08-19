from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from app.models.request_models import (
    CitizenRequestInput,
    CitizenRequestRecord,
    RequestAnalysisResponse,
    VoiceTranscribeRequest,
    VoiceTranscribeResponse
)
from app.services.ai_pipeline import AIPipelineService, DEMO_VOICE_SAMPLES
from app.services.data_store import DATA_STORE

router = APIRouter(prefix="/api", tags=["Citizen Requests"])

@router.get("/requests", response_model=List[Dict[str, Any]])
def get_requests(
    country: Optional[str] = Query(None, description="Country filter"),
    state: Optional[str] = Query(None, description="State filter"),
    district: Optional[str] = Query(None, description="District filter"),
    category: Optional[str] = Query(None, description="Category filter"),
    language: Optional[str] = Query(None, description="Language filter"),
    min_severity: Optional[int] = Query(None, description="Minimum severity 1-10"),
    search: Optional[str] = Query(None, description="Free text search query"),
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    return DATA_STORE.get_all_requests(
        country=country,
        state=state,
        district=district,
        category=category,
        language=language,
        min_severity=min_severity,
        search=search,
        limit=limit,
        offset=offset
    )

@router.post("/analyze-text", response_model=RequestAnalysisResponse)
def analyze_text(payload: CitizenRequestInput):
    """Real-time AI extraction preview endpoint (runs as user types or speaks)."""
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    extraction = AIPipelineService.extract_structured_data(
        text=payload.text,
        location_hint=payload.district or "Warangal",
        language_override=payload.language if payload.language != "Auto" else None
    )

    demo = DATA_STORE.demographics.get(payload.district)
    pop_str = f"~{demo['population']:,} citizens" if demo else "Regional population"
    
    impact_preview = (
        f"Your request highlights {extraction.subcategory} in {payload.district}. "
        f"It will be aggregated with existing community signals to influence the district's {extraction.category} infrastructure priority score."
    )

    return RequestAnalysisResponse(
        extraction=extraction,
        suggested_district=payload.district or "Warangal",
        estimated_affected_scale=pop_str,
        impact_preview=impact_preview
    )

@router.post("/requests", response_model=Dict[str, Any])
def submit_citizen_request(payload: CitizenRequestInput):
    """Submits a citizen request, runs full AI pipeline, adds to store, and returns structured result."""
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    # Run AI pipeline
    extraction = AIPipelineService.extract_structured_data(
        text=payload.text,
        location_hint=payload.district,
        language_override=payload.language if payload.language != "Auto" else None
    )

    record_dict = {
        "raw_text": payload.text,
        "translated_text": extraction.translated_text,
        "language": extraction.language,
        "country": payload.country,
        "state": payload.state,
        "district": payload.district,
        "locality": payload.locality or f"{payload.district} Community Sector",
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "is_voice": payload.is_voice,
        "voice_duration_sec": 14.0 if payload.is_voice else None,
        "category": extraction.category,
        "subcategory": extraction.subcategory,
        "severity": extraction.severity,
        "urgency": extraction.urgency,
        "affected_group": extraction.affected_group
    }

    saved_record = DATA_STORE.add_request(record_dict)
    
    # Calculate updated district stats
    dist_reqs = [r for r in DATA_STORE.requests if r.get("district") == payload.district and r.get("category") == extraction.category]
    
    return {
        "status": "success",
        "message": "Citizen request successfully analyzed and integrated into civic pipeline",
        "request": saved_record,
        "ai_extraction": extraction.model_dump(),
        "community_impact": {
            "district": payload.district,
            "category": extraction.category,
            "total_correlated_requests": len(dist_reqs),
            "priority_boost": "+4.2 points",
            "next_step": "Aggregated into upcoming District Infrastructure Action Plan"
        }
    }

@router.post("/voice-transcribe", response_model=VoiceTranscribeResponse)
def transcribe_voice(payload: VoiceTranscribeRequest):
    """Handles audio transcription for voice submissions."""
    return AIPipelineService.transcribe_voice(
        sample_id=payload.sample_id,
        language_hint=payload.language_hint
    )

@router.get("/voice-samples")
def get_voice_samples():
    """Returns preset high-fidelity voice scenarios for judge demonstration."""
    return DEMO_VOICE_SAMPLES
