import json
from unittest.mock import patch
from datetime import date
import httpx

from app.core.config import settings


def test_health_check(client):
    """Verify healthcheck endpoint and security headers."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "DENY"


def test_create_notice_success(client):
    """Verify successful notice creation with full valid payload in MongoDB."""
    payload = {
        "title": "Machine Learning Lab Submission",
        "description": "Submit notebook and report by Friday.",
        "category": "Assignment",
        "event_date": "2026-11-06",
        "event_time": "14:00:00",
        "venue": "Lab 3",
        "priority": "Important",
    }
    response = client.post("/api/v1/notices", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert isinstance(data["id"], str)
    assert len(data["id"]) > 0
    assert data["title"] == "Machine Learning Lab Submission"
    assert data["category"] == "Assignment"
    assert data["priority"] == "Important"
    assert data["venue"] == "Lab 3"
    assert "created_at" in data
    assert "updated_at" in data


def test_create_notice_invalid_title(client):
    """Verify rejection of empty title."""
    payload = {
        "title": "   ",
        "category": "Assignment",
        "event_date": "2026-11-06",
    }
    response = client.post("/api/v1/notices", json=payload)
    assert response.status_code == 422


def test_create_notice_invalid_category(client):
    """Verify rejection of invalid category."""
    payload = {
        "title": "Invalid Category Notice",
        "category": "SportsTournament",  # Not in allowed categories
        "event_date": "2026-11-06",
    }
    response = client.post("/api/v1/notices", json=payload)
    assert response.status_code == 422


def test_get_notice_by_id(client):
    """Verify notice retrieval by ID and 404 behavior."""
    payload = {
        "title": "Campus Townhall",
        "category": "General",
        "event_date": "2026-11-10",
        "priority": "Normal",
    }
    create_res = client.post("/api/v1/notices", json=payload)
    notice_id = create_res.json()["id"]

    # Valid ID lookup
    get_res = client.get(f"/api/v1/notices/{notice_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Campus Townhall"

    # Non-existent valid ObjectId format lookup -> 404
    not_found_res = client.get("/api/v1/notices/65f1a2b3c4d5e6f7a8b9c0d1")
    assert not_found_res.status_code == 404

    # Non-existent arbitrary string ID lookup -> 404
    invalid_id_res = client.get("/api/v1/notices/nonexistent-id-999")
    assert invalid_id_res.status_code == 404


def test_list_and_filter_notices(client):
    """Verify searching and filtering on listed notices in MongoDB."""
    notices_to_create = [
        {
            "title": "Final Physics Exam",
            "category": "Examination",
            "event_date": "2026-11-15",
            "priority": "Urgent",
            "venue": "Hall B",
        },
        {
            "title": "Chemistry Workshop",
            "category": "Event",
            "event_date": "2026-11-20",
            "priority": "Normal",
            "venue": "Lab 1",
        },
        {
            "title": "Math Quiz Assignment",
            "category": "Assignment",
            "event_date": "2026-11-08",
            "priority": "Important",
            "venue": "Room 101",
        },
    ]
    for n in notices_to_create:
        res = client.post("/api/v1/notices", json=n)
        assert res.status_code == 201

    all_res = client.get("/api/v1/notices")
    assert all_res.status_code == 200
    assert all_res.json()["total"] == 3

    exam_res = client.get("/api/v1/notices?category=Examination")
    assert exam_res.status_code == 200
    assert exam_res.json()["total"] == 1
    assert exam_res.json()["items"][0]["title"] == "Final Physics Exam"

    search_res = client.get("/api/v1/notices?search=Chemistry")
    assert search_res.status_code == 200
    assert search_res.json()["total"] == 1
    assert search_res.json()["items"][0]["title"] == "Chemistry Workshop"

    priority_res = client.get("/api/v1/notices?priority=Urgent")
    assert priority_res.status_code == 200
    assert priority_res.json()["total"] == 1

    # Date range filter
    date_res = client.get("/api/v1/notices?start_date=2026-11-10&end_date=2026-11-22")
    assert date_res.status_code == 200
    assert date_res.json()["total"] == 2


def test_update_notice(client):
    """Verify partial notice updates."""
    payload = {
        "title": "Original Title",
        "category": "General",
        "event_date": "2026-11-12",
        "priority": "Normal",
    }
    create_res = client.post("/api/v1/notices", json=payload)
    notice_id = create_res.json()["id"]

    update_payload = {
        "title": "Updated Title",
        "priority": "Urgent",
    }
    update_res = client.put(f"/api/v1/notices/{notice_id}", json=update_payload)
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["title"] == "Updated Title"
    assert data["priority"] == "Urgent"
    assert data["category"] == "General"

    # Update non-existent notice
    missing_res = client.put("/api/v1/notices/65f1a2b3c4d5e6f7a8b9c0d1", json={"title": "Test"})
    assert missing_res.status_code == 404


def test_delete_notice(client):
    """Verify deleting notices and handling subsequent requests."""
    payload = {
        "title": "Temporary Notice",
        "category": "Holiday",
        "event_date": "2026-11-25",
    }
    create_res = client.post("/api/v1/notices", json=payload)
    notice_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/notices/{notice_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/notices/{notice_id}")
    assert get_res.status_code == 404

    # Delete already-deleted notice -> 404
    del_again_res = client.delete(f"/api/v1/notices/{notice_id}")
    assert del_again_res.status_code == 404


# ==============================================================================
# Phase 4: AI Extraction Tests
# ==============================================================================

def test_extract_notice_missing_api_key(client):
    """Verify 503 response when AI_API_KEY is not configured."""
    original_key = settings.AI_API_KEY
    try:
        settings.AI_API_KEY = ""
        response = client.post(
            "/api/v1/notices/extract",
            json={"text": "Assignment due tomorrow at 10 AM in Lab 1."},
        )
        assert response.status_code == 503
        assert "not configured" in response.json()["detail"].lower()
    finally:
        settings.AI_API_KEY = original_key


def test_extract_notice_empty_text(client):
    """Verify 422 response when input text is empty."""
    response = client.post(
        "/api/v1/notices/extract",
        json={"text": "   "},
    )
    assert response.status_code == 422


@patch("httpx.AsyncClient.post")
def test_extract_notice_success(mock_post, client):
    """Verify successful AI extraction with mock Gemini response."""
    original_key = settings.AI_API_KEY
    try:
        settings.AI_API_KEY = "test-mock-api-key"
        mock_ai_output = {
            "title": "Database Lab Submission",
            "event_date": "2026-11-05",
            "event_time": "10:00:00",
            "venue": "Computer Lab 2",
            "category": "Assignment",
            "priority": "Urgent",
        }
        mock_response = httpx.Response(
            200,
            json={
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {"text": json.dumps(mock_ai_output)}
                            ]
                        }
                    }
                ]
            },
            request=httpx.Request("POST", "https://mock.url"),
        )
        mock_post.return_value = mock_response

        response = client.post(
            "/api/v1/notices/extract",
            json={"text": "Submit DB lab on 5 Nov by 10 AM in Computer Lab 2."},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Database Lab Submission"
        assert data["event_date"] == "2026-11-05"
        assert data["event_time"] == "10:00:00"
        assert data["venue"] == "Computer Lab 2"
        assert data["category"] == "Assignment"
        assert data["priority"] == "Urgent"
    finally:
        settings.AI_API_KEY = original_key


@patch("httpx.AsyncClient.post")
def test_extract_notice_missing_or_null_fields(mock_post, client):
    """Verify safe handling of null dates and times returned by AI."""
    original_key = settings.AI_API_KEY
    try:
        settings.AI_API_KEY = "test-mock-api-key"
        mock_ai_output = {
            "title": "General Campus Notice",
            "event_date": None,
            "event_time": None,
            "venue": None,
            "category": "General",
            "priority": "Normal",
        }
        mock_response = httpx.Response(
            200,
            json={
                "candidates": [
                    {"content": {"parts": [{"text": json.dumps(mock_ai_output)}]}}
                ]
            },
            request=httpx.Request("POST", "https://mock.url"),
        )
        mock_post.return_value = mock_response

        response = client.post(
            "/api/v1/notices/extract",
            json={"text": "Please note campus administrative office timings."},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "General Campus Notice"
        assert data["event_date"] is None
        assert data["event_time"] is None
        assert data["venue"] is None
        assert data["category"] == "General"
        assert data["priority"] == "Normal"
    finally:
        settings.AI_API_KEY = original_key


@patch("httpx.AsyncClient.post")
def test_extract_notice_invalid_ai_output(mock_post, client):
    """Verify handling when AI returns malformed non-JSON output."""
    original_key = settings.AI_API_KEY
    try:
        settings.AI_API_KEY = "test-mock-api-key"
        mock_response = httpx.Response(
            200,
            json={
                "candidates": [
                    {"content": {"parts": [{"text": "I am unable to parse this notice."}]}}
                ]
            },
            request=httpx.Request("POST", "https://mock.url"),
        )
        mock_post.return_value = mock_response

        response = client.post(
            "/api/v1/notices/extract",
            json={"text": "Some random text."},
        )
        assert response.status_code == 502
        assert "parse structured notice" in response.json()["detail"].lower()
    finally:
        settings.AI_API_KEY = original_key


@patch("httpx.AsyncClient.post")
def test_extract_notice_provider_error(mock_post, client):
    """Verify safe error response when AI provider fails with 500 status."""
    original_key = settings.AI_API_KEY
    try:
        settings.AI_API_KEY = "test-mock-api-key"
        mock_response = httpx.Response(
            500,
            json={"error": "Internal server error from provider"},
            request=httpx.Request("POST", "https://mock.url"),
        )
        mock_post.return_value = mock_response

        response = client.post(
            "/api/v1/notices/extract",
            json={"text": "Notice text that triggers external failure."},
        )
        assert response.status_code == 502
        assert "error" in response.json()["detail"].lower()
    finally:
        settings.AI_API_KEY = original_key


@patch("httpx.AsyncClient.post")
def test_extract_notice_timeout_error(mock_post, client):
    """Verify 504 Gateway Timeout when AI request times out."""
    original_key = settings.AI_API_KEY
    try:
        settings.AI_API_KEY = "test-mock-api-key"
        mock_post.side_effect = httpx.TimeoutException("Connection timed out")

        response = client.post(
            "/api/v1/notices/extract",
            json={"text": "Notice text that times out."},
        )
        assert response.status_code == 504
        assert "timed out" in response.json()["detail"].lower()
    finally:
        settings.AI_API_KEY = original_key


@patch("httpx.AsyncClient.post")
def test_notice_workflow_end_to_end(mock_post, client):
    """Verify complete notice lifecycle in MongoDB: extract -> edit/confirm -> list/search -> update -> delete."""
    original_key = settings.AI_API_KEY
    try:
        settings.AI_API_KEY = "test-mock-api-key"

        # 1. Simulate AI extraction
        mock_ai_output = {
            "title": "Robotics Club Workshop",
            "event_date": "2026-11-18",
            "event_time": "15:00:00",
            "venue": "Makerspace Hall",
            "category": "Event",
            "priority": "Normal",
        }
        mock_response = httpx.Response(
            200,
            json={
                "candidates": [
                    {"content": {"parts": [{"text": json.dumps(mock_ai_output)}]}}
                ]
            },
            request=httpx.Request("POST", "https://mock.url"),
        )
        mock_post.return_value = mock_response

        raw_notice = "Robotics Club workshop scheduled for Nov 18 at 3 PM in Makerspace Hall."
        extract_res = client.post("/api/v1/notices/extract", json={"text": raw_notice})
        assert extract_res.status_code == 200
        extracted_data = extract_res.json()

        # 2. User edits preview and confirms save
        save_payload = {
            "title": "Annual Robotics Club Workshop (Confirmed)",
            "description": raw_notice,
            "category": extracted_data["category"],
            "event_date": extracted_data["event_date"],
            "event_time": extracted_data["event_time"],
            "venue": "Makerspace Hall B",
            "priority": "Important",
        }
        create_res = client.post("/api/v1/notices", json=save_payload)
        assert create_res.status_code == 201
        saved_notice = create_res.json()
        notice_id = saved_notice["id"]
        assert isinstance(notice_id, str)
        assert saved_notice["title"] == "Annual Robotics Club Workshop (Confirmed)"

        # 3. Verify notice appears in list and search
        search_res = client.get("/api/v1/notices?search=Robotics")
        assert search_res.status_code == 200
        assert search_res.json()["total"] == 1
        assert search_res.json()["items"][0]["id"] == notice_id

        # 4. Verify notice appears in category filter
        category_res = client.get("/api/v1/notices?category=Event")
        assert category_res.status_code == 200
        assert category_res.json()["total"] == 1

        # 5. User updates notice details
        update_res = client.put(
            f"/api/v1/notices/{notice_id}",
            json={"priority": "Urgent", "venue": "Auditorium"},
        )
        assert update_res.status_code == 200
        assert update_res.json()["priority"] == "Urgent"
        assert update_res.json()["venue"] == "Auditorium"

        # 6. User deletes notice
        del_res = client.delete(f"/api/v1/notices/{notice_id}")
        assert del_res.status_code == 204

        # 7. Verification: notice no longer exists
        get_res = client.get(f"/api/v1/notices/{notice_id}")
        assert get_res.status_code == 404
    finally:
        settings.AI_API_KEY = original_key
