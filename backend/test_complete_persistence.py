import uuid
from app.db.session import init_db, SessionLocal
from app.db.models import CitizenRequestDB
from app.services.data_store import DATA_STORE

def run_tests():
    init_db()
    db = SessionLocal()
    initial_count = db.query(CitizenRequestDB).count()
    print(f"Initial DB Count: {initial_count}")

    # 1. Add a test citizen feedback
    unique_marker = uuid.uuid4().hex[:6]
    test_text = f"Severe road sinkhole on Karimnagar Bypass near Collectorate [test-{unique_marker}]"
    
    record = DATA_STORE.add_request({
        "raw_text": test_text,
        "translated_text": test_text,
        "language": "Telugu",
        "is_voice": True,
        "country": "India",
        "state": "Telangana",
        "district": "Warangal",
        "locality": "Karimnagar Bypass Area",
        "latitude": 17.9812,
        "longitude": 79.5982,
        "category": "Transportation",
        "subcategory": "Rural Road Connectivity",
        "severity": 9,
        "urgency": "Critical",
        "affected_group": "Commuters & School Children",
        "sentiment": "Critical / Distressed",
        "key_entities": "Warangal, Transportation, Road"
    })

    req_id = record["request_id"]
    print(f"1. Created Record: ID={record['id']}, ReqID={req_id}, is_demo={record['is_demo']}")

    # 2. Confirm record exists in DB
    db_item = db.query(CitizenRequestDB).filter(CitizenRequestDB.request_id == req_id).first()
    assert db_item is not None, "Record not found in database!"
    assert db_item.raw_text == test_text
    assert db_item.is_demo is False
    print(f"2. Confirmed in DB: ID={db_item.id}, ReqID={db_item.request_id}, is_demo={db_item.is_demo}")

    # 3. Check all required fields
    assert db_item.request_id.startswith("REQ-"), "Missing or invalid unique ID"
    assert db_item.input_source == "voice", "Missing user/input source"
    assert db_item.raw_text == test_text, "Missing original feedback"
    assert db_item.language == "Telugu", "Missing language"
    assert db_item.translated_text == test_text, "Missing translated text"
    assert db_item.category == "Transportation", "Missing category"
    assert db_item.district == "Warangal", "Missing district/region"
    assert db_item.created_at is not None, "Missing timestamp"
    assert db_item.severity == 9 and db_item.urgency == "Critical", "Missing priority/severity"
    assert db_item.affected_group == "Commuters & School Children", "Missing AI analysis"
    assert db_item.latitude == 17.9812 and db_item.longitude == 79.5982, "Missing geospatial info"
    print("3. Verified all required fields are present and accurate.")

    # 4. Query via get_all_requests
    requests = DATA_STORE.get_all_requests(country="India", limit=10)
    assert len(requests) > 0
    top = requests[0]
    print(f"4. Top request from get_all_requests: {top['request_id']}, is_demo={top['is_demo']}")
    assert top["request_id"] == req_id, f"Expected top to be {req_id}, got {top['request_id']}"
    assert top["is_demo"] is False, "Expected is_demo to be False"

    # 5. Simulate backend restart
    db.close()
    print("5. Simulating backend restart (re-instantiating DataStore)...")
    from app.services.data_store import DataStore
    fresh_store = DataStore()
    restarted_requests = fresh_store.get_all_requests(country="India", limit=10)
    top_after_restart = restarted_requests[0]
    print(f"5b. Top request after restart: {top_after_restart['request_id']}, is_demo={top_after_restart['is_demo']}")
    assert top_after_restart["request_id"] == req_id, f"Failed persistence check across restart! Expected {req_id}, got {top_after_restart['request_id']}"
    assert top_after_restart["is_demo"] is False, "Expected is_demo to be False across restart"

    print("\n>>> ALL PERSISTENCE AND RESTART TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_tests()
