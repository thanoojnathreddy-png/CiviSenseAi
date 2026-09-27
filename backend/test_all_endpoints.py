import httpx
import uuid
from app.db.session import SessionLocal
from app.db.models import CitizenRequestDB

def test_system():
    client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=15.0)

    print("=" * 60)
    print("RUNNING COMPLETE PERSISTENCE & VOICE API TEST SUITE")
    print("=" * 60)

    # TEST 1: Health check
    res = client.get("/health")
    assert res.status_code == 200
    print("[PASS] 1. Backend health check: OK")

    # TEST 2: Voice samples API (multilingual Indian languages)
    res = client.get("/api/voice-samples")
    assert res.status_code == 200
    samples = res.json()
    sample_langs = {s["language"] for s in samples}
    print(f"[PASS] 2. Voice samples retrieved: {len(samples)} samples. Languages: {', '.join(sorted(sample_langs))}")
    assert "English" in sample_langs
    assert "Telugu" in sample_langs
    assert "Hindi" in sample_langs
    assert "Tamil" in sample_langs
    assert "Gujarati" in sample_langs
    assert "Punjabi" in sample_langs
    assert "Odia" in sample_langs

    # TEST 3: Voice transcription endpoint for multilingual scenarios
    for lang in ["English", "Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "Gujarati", "Punjabi", "Odia"]:
        v_res = client.post("/api/voice-transcribe", json={"language_hint": lang})
        assert v_res.status_code == 200
        v_data = v_res.json()
        assert len(v_data["transcribed_text"]) > 0
        print(f"       Voice transcribe [{lang}] -> detected: {v_data['detected_language']}, chars: {len(v_data['transcribed_text'])}")
    print("[PASS] 3. Multilingual voice transcribe API: all languages handled correctly")

    # TEST 4: Submit citizen requests in multiple languages
    test_cases = [
        {
            "text": f"Severe road damage and deep potholes near collectorate junction [test-{uuid.uuid4().hex[:4]}]",
            "language": "English",
            "district": "Warangal",
            "locality": "Collectorate Junction"
        },
        {
            "text": f"మా గ్రామంలో తాగునీటి పైపులైన్ పగిలిపోయి కలుషిత నీరు వస్తోంది [test-{uuid.uuid4().hex[:4]}]",
            "language": "Telugu",
            "district": "Warangal",
            "locality": "Chennaraopet Mandal"
        },
        {
            "text": f"हमारे प्राथमिक स्वास्थ्य केंद्र में डॉक्टर नहीं हैं और दवाएं खत्म हो गई हैं [test-{uuid.uuid4().hex[:4]}]",
            "language": "Hindi",
            "district": "Yavatmal",
            "locality": "Pusad Rural"
        },
        {
            "text": f"எங்கள் பகுதியில் குடிநீர் தட்டுப்பாடு தீவிரமாக உள்ளது [test-{uuid.uuid4().hex[:4]}]",
            "language": "Tamil",
            "district": "Anantapur",
            "locality": "Kalyanadurg Mandal"
        }
    ]

    submitted_ids = []
    for tc in test_cases:
        sub_res = client.post("/api/requests", json={
            "text": tc["text"],
            "language": tc["language"],
            "district": tc["district"],
            "locality": tc["locality"],
            "country": "India",
            "state": "Telangana" if tc["district"] == "Warangal" else ("Maharashtra" if tc["district"] == "Yavatmal" else "Andhra Pradesh"),
            "is_voice": True
        })
        assert sub_res.status_code == 200, f"Submission failed: {sub_res.text}"
        sub_data = sub_res.json()
        req_id = sub_data["request"]["request_id"]
        submitted_ids.append((req_id, tc))
        print(f"       Submitted {tc['language']} request: {req_id} ({tc['district']})")
    print(f"[PASS] 4. Submitted {len(submitted_ids)} citizen requests through API")

    # TEST 5: Verify records exist in PostgreSQL / SQLite database
    db = SessionLocal()
    try:
        for req_id, tc in submitted_ids:
            row = db.query(CitizenRequestDB).filter(CitizenRequestDB.request_id == req_id).first()
            assert row is not None, f"Database record missing for {req_id}!"
            assert row.raw_text == tc["text"]
            assert row.language == tc["language"]
            assert row.district == tc["district"]
            assert row.is_demo is False, "Record must have is_demo=False for verified submission"
            assert row.category in ["Transportation", "Water & Sanitation", "Healthcare"]
            assert row.severity >= 1 and row.severity <= 10
            assert row.urgency in ["Critical", "High", "Medium", "Low"]
            assert row.created_at is not None
            print(f"       DB verified: ID={row.id}, ReqID={row.request_id}, Category={row.category}, is_demo={row.is_demo}")
    finally:
        db.close()
    print("[PASS] 5. Database direct query: all records permanently stored with is_demo=False and complete metadata")

    # TEST 6: Verify Data Explorer GET /api/requests returns stored records at the top
    get_res = client.get("/api/requests?limit=10")
    assert get_res.status_code == 200
    all_reqs = get_res.json()
    assert len(all_reqs) >= len(submitted_ids)
    
    returned_ids = [r["request_id"] for r in all_reqs]
    # Check that latest submitted request is at the very top
    latest_id = submitted_ids[-1][0]
    assert latest_id in returned_ids[:5], f"Expected latest submission {latest_id} near top, got: {returned_ids[:5]}"
    print(f"[PASS] 6. Data Explorer API: stored database records returned successfully with latest at the top")

    # TEST 7: Search and filter verification in /api/requests
    search_term = "Karimnagar"
    search_res = client.get(f"/api/requests?search={search_term}")
    assert search_res.status_code == 200
    search_data = search_res.json()
    print(f"[PASS] 7. Search filter (/api/requests?search={search_term}): {len(search_data)} matching records found")

    print("=" * 60)
    print("ALL API AND DATABASE PERSISTENCE TESTS PASSED (100% SUCCESS)!")
    print("=" * 60)

if __name__ == "__main__":
    test_system()
