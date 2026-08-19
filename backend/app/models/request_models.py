from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class CitizenRequestInput(BaseModel):
    text: str = Field(..., description="Raw text or transcribed voice from citizen")
    language: str = Field(default="English", description="Input language (e.g., English, Telugu, Hindi, Tamil, Portuguese)")
    country: str = "India"
    state: Optional[str] = "Telangana"
    district: Optional[str] = "Warangal"
    locality: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_voice: bool = False
    voice_audio_id: Optional[str] = None

class AIStructuredExtraction(BaseModel):
    category: str = Field(..., description="Transportation, Water & Sanitation, Healthcare, Education, Waste Management, Power & Energy")
    subcategory: str
    location: str
    severity: int = Field(..., ge=1, le=10, description="Severity rating on 1-10 scale")
    urgency: str = Field(..., description="Critical, High, Medium, Low")
    affected_group: str = Field(..., description="Students, Farmers, Elderly, Patients, General Public, Daily Commuters")
    language: str
    translated_text: str = Field(..., description="English translation of citizen request")
    key_entities: List[str] = []
    sentiment: str = "Negative / Distressed"
    sentiment_score: float = -0.75

class CitizenRequestRecord(BaseModel):
    request_id: str
    created_at: str
    raw_text: str
    translated_text: str
    language: str
    country: str
    state: str
    district: str
    locality: Optional[str] = None
    latitude: float
    longitude: float
    is_voice: bool
    voice_duration_sec: Optional[float] = None
    category: str
    subcategory: str
    severity: int
    urgency: str
    affected_group: str
    status: str = "Under Policy Review" # Under Policy Review, Actioned in Recommendation, Resolved
    linked_recommendation_id: Optional[str] = None

class RequestAnalysisResponse(BaseModel):
    extraction: AIStructuredExtraction
    suggested_district: str
    estimated_affected_scale: str
    impact_preview: str

class VoiceTranscribeRequest(BaseModel):
    audio_base64: Optional[str] = None
    language_hint: str = "Telugu"
    sample_id: Optional[str] = None

class VoiceTranscribeResponse(BaseModel):
    transcribed_text: str
    detected_language: str
    confidence: float
    duration_seconds: float
