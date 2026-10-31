import logging
from pymongo import MongoClient
from pymongo.database import Database
from app.core.config import settings

logger = logging.getLogger("campus_pulse.database")

_mongo_client = None


def get_mongo_client() -> MongoClient:
    """Return or initialize the singleton PyMongo MongoClient."""
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            maxPoolSize=50,
        )
    return _mongo_client


def get_db():
    """FastAPI dependency yielding the configured MongoDB database."""
    client = get_mongo_client()
    db = client[settings.MONGODB_DATABASE]
    try:
        yield db
    finally:
        pass
