import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["platform"] == "CivicPulse AI"
    
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_get_stats():
    res = client.get("/api/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["total_requests"] >= 100
    assert "Transportation" in data["category_distribution"]
    assert "Telugu" in data["language_distribution"]

def test_get_hotspots():
    res = client.get("/api/hotspots")
    assert res.status_code == 200
    hotspots = res.json()
    assert len(hotspots) > 0
    assert "composite_priority_score" in hotspots[0]

def test_get_recommendations():
    res = client.get("/api/recommendations")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) > 0
    assert recs[0]["priority_score"] >= recs[-1]["priority_score"]

def test_analyze_and_submit_telugu_request():
    payload = {
        "text": "మా గ్రామంలో రోడ్డు సరిగా లేదు. వర్షాకాలంలో పిల్లలు బడికి వెళ్లడానికి చాలా ఇబ్బంది పడుతున్నారు.",
        "language": "Telugu",
        "country": "India",
        "state": "Telangana",
        "district": "Warangal",
        "locality": "Chennaraopet",
        "is_voice": True
    }
    
    # 1. Analyze preview
    res_preview = client.post("/api/analyze-text", json=payload)
    assert res_preview.status_code == 200
    ext = res_preview.json()["extraction"]
    assert ext["category"] == "Transportation"
    assert ext["language"] == "Telugu"
    assert "road" in ext["translated_text"].lower()

    # 2. Submit request
    res_sub = client.post("/api/requests", json=payload)
    assert res_sub.status_code == 200
    sub_data = res_sub.json()
    assert sub_data["status"] == "success"
    assert sub_data["request"]["category"] == "Transportation"
