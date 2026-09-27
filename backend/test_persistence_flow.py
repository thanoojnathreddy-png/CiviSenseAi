import httpx
from app.db.session import SessionLocal
from app.db.models import CitizenRequestDB

def test_data_persistence():
    # 1 & 2: Submit a civic complaint
    test_text = "Severe road sinkhole on Karimnagar Bypass near Collectorate"
    res = httpx.post(
        "http://127.0.0.1:8000/api/requests",
        json={"text": test_text, "district": "Warangal", "language": "Telugu"},
        timeout=10.0
    )
    assert res.status_code == 200, f"Submission failed: {res.status_code}"
    data = res.json()
    req_id = data["request"]["request_id"]
    print(f"Step 1 & 2: Successfully submitted request: {req_id}")

    # 3: Verify record exists in database
    db = SessionLocal()
    try:
        db_row = db.query(CitizenRequestDB).filter(CitizenRequestDB.request_id == req_id).first()
        assert db_row is not None, f"Record {req_id} not found in database!"
        assert db_row.raw_text == test_text
        assert db_row.is_demo is False
        print(f"Step 3: Confirmed record in database table citizen_requests (DB ID: {db_row.id}, is_demo: {db_row.is_demo})")
    finally:
        db.close()

    # 4: Query /api/requests
    get_res = httpx.get("http://127.0.0.1:8000/api/requests", timeout=10.0)
    assert get_res.status_code == 200
    all_requests = get_res.json()
    assert len(all_requests) > 0
    top_req = all_requests[0]
    assert top_req["request_id"] == req_id, f"Expected top request {req_id}, got {top_req['request_id']}"
    assert top_req["is_demo"] is False
    print(f"Step 4 & 5: Verified record is top item in /api/requests: {top_req['request_id']}")
    print("ALL PERSISTENCE CHECKS PASSED!")

if __name__ == "__main__":
    test_data_persistence()
