from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import requests, dashboard, recommendations, demographics, community_needs, insights

app = FastAPI(
    title="CivicPulse AI API",
    description="Multilingual AI-powered Digital Public Good connecting citizen development requests with explainable infrastructure priorities for policymakers across BRICS nations.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(requests.router)
app.include_router(community_needs.router)
app.include_router(dashboard.router)
app.include_router(recommendations.router)
app.include_router(demographics.router)
app.include_router(insights.router)

# Mount direct alias so both /api/transcribe-audio and /transcribe-audio succeed without 404
from app.routers.requests import transcribe_audio_file
from app.models.request_models import VoiceTranscribeResponse

app.add_api_route(
    "/transcribe-audio",
    transcribe_audio_file,
    methods=["POST"],
    response_model=VoiceTranscribeResponse,
    tags=["Citizen Requests"]
)

@app.on_event("startup")
def on_startup():
    from app.db.session import init_db
    init_db()
    from app.services.ai_pipeline import log_startup_diagnostics
    log_startup_diagnostics()

@app.get("/")
def root():
    return {
        "platform": "CivicPulse AI",
        "description": "Digital Public Good for Multilingual Civic Intelligence & Infrastructure Prioritization",
        "status": "online",
        "supported_brics_nations": ["India", "Brazil", "South Africa", "Russia", "China"],
        "api_docs": "/docs"
    }

@app.get("/health")
def health_check():
    from app.services.ai_pipeline import get_gemini_diagnostics
    diag = get_gemini_diagnostics()
    return {
        "status": "healthy",
        "gemini_configured": diag["configured"],
        "gemini_diagnostics": {
            "key_present": diag["present"],
            "key_length": diag["length"],
            "key_whitespace_trimmed": diag["trimmed"],
            "key_masked_preview": diag["preview"]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
