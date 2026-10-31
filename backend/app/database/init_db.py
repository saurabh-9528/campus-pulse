"""Database initialization and index creation script for MongoDB Atlas / MongoDB."""
import sys
from pymongo import ASCENDING, TEXT
from app.core.config import settings
from app.database.connection import get_mongo_client


def init_db():
    """Create all necessary indexes on MongoDB collections."""
    print(f"Connecting to MongoDB database: '{settings.MONGODB_DATABASE}'...")
    try:
        client = get_mongo_client()
        # Verify connection
        client.admin.command("ping")
        print("Connected to MongoDB successfully.")

        db = client[settings.MONGODB_DATABASE]
        notices_col = db["notices"]

        # Create indexes for filtering, sorting, and search performance
        notices_col.create_index([("event_date", ASCENDING)], name="idx_notices_event_date")
        notices_col.create_index([("category", ASCENDING)], name="idx_notices_category")
        notices_col.create_index([("priority", ASCENDING)], name="idx_notices_priority")
        notices_col.create_index(
            [("event_date", ASCENDING), ("category", ASCENDING)],
            name="idx_notices_date_category",
        )
        notices_col.create_index(
            [("event_date", ASCENDING), ("event_time", ASCENDING)],
            name="idx_notices_date_time",
        )

        print("Successfully created/verified MongoDB collection indexes for 'notices'.")
    except Exception as e:
        print(f"Error connecting to MongoDB or initializing indexes: {e}", file=sys.stderr)
        raise


if __name__ == "__main__":
    init_db()
