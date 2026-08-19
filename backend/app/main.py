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
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
