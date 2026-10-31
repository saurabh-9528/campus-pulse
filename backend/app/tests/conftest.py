import pytest
import mongomock
from fastapi.testclient import TestClient

from app.main import app
from app.database.connection import get_db
from app.core.security import extract_rate_limiter


@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    """Provide a fresh, isolated in-memory MongoDB database for every test."""
    mock_client = mongomock.MongoClient()
    test_db = mock_client["test_campus_pulse"]

    def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    extract_rate_limiter.reset()
    yield
    test_db.notices.drop()
    extract_rate_limiter.reset()


@pytest.fixture
def client():
    return TestClient(app)
