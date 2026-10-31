import re
from datetime import date, time, datetime, timezone
from typing import Optional, Tuple, List, Dict, Any
from bson import ObjectId
from pymongo.database import Database
from pymongo import ReturnDocument

from app.schemas.notice import NoticeCreate, NoticeUpdate


def _parse_object_id(notice_id: str) -> Optional[ObjectId]:
    """Safely parse a string into a BSON ObjectId."""
    try:
        if ObjectId.is_valid(notice_id):
            return ObjectId(notice_id)
    except Exception:
        pass
    return None


def _doc_to_notice(doc: Optional[dict]) -> Optional[dict]:
    """Convert a MongoDB BSON document into a dictionary formatted for NoticeResponse."""
    if not doc:
        return None
    d = dict(doc)
    d["id"] = str(d.pop("_id"))

    # Convert string dates/times to datetime date/time objects if needed
    if isinstance(d.get("event_date"), str):
        d["event_date"] = date.fromisoformat(d["event_date"])

    if isinstance(d.get("event_time"), str):
        d["event_time"] = time.fromisoformat(d["event_time"])

    return d


def create_notice(db: Database, notice_in: NoticeCreate) -> dict:
    """Create and persist a new notice document in MongoDB."""
    now = datetime.now(timezone.utc)
    doc = {
        "title": notice_in.title,
        "description": notice_in.description,
        "category": notice_in.category.value,
        "event_date": notice_in.event_date.isoformat(),
        "event_time": notice_in.event_time.isoformat() if notice_in.event_time else None,
        "venue": notice_in.venue,
        "priority": notice_in.priority.value,
        "created_at": now,
        "updated_at": now,
    }
    res = db.notices.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _doc_to_notice(doc)


def get_notice_by_id(db: Database, notice_id: str) -> Optional[dict]:
    """Retrieve an individual notice document by its unique string ID."""
    oid = _parse_object_id(notice_id)
    if not oid:
        return None
    doc = db.notices.find_one({"_id": oid})
    return _doc_to_notice(doc)


def list_notices(
    db: Database,
    search: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[dict], int]:
    """Retrieve filtered, searched, and paginated notices from MongoDB."""
    query: Dict[str, Any] = {}

    # Case-insensitive substring search across title, description, and venue
    if search:
        search_term = search.strip()
        if search_term:
            escaped = re.escape(search_term)
            query["$or"] = [
                {"title": {"$regex": escaped, "$options": "i"}},
                {"description": {"$regex": escaped, "$options": "i"}},
                {"venue": {"$regex": escaped, "$options": "i"}},
            ]

    # Category filter
    if category and category.lower() != "all":
        query["category"] = {"$regex": f"^{re.escape(category.strip())}$", "$options": "i"}

    # Priority filter
    if priority and priority.lower() != "all":
        query["priority"] = {"$regex": f"^{re.escape(priority.strip())}$", "$options": "i"}

    # Date range filters using ISO strings
    date_filter: Dict[str, str] = {}
    if start_date:
        date_filter["$gte"] = start_date.isoformat()
    if end_date:
        date_filter["$lte"] = end_date.isoformat()
    if date_filter:
        query["event_date"] = date_filter

    total = db.notices.count_documents(query)

    offset = max(0, (page - 1) * limit)
    cursor = (
        db.notices.find(query)
        .sort([("event_date", 1), ("event_time", 1), ("_id", 1)])
        .skip(offset)
        .limit(limit)
    )

    items = [_doc_to_notice(doc) for doc in cursor]
    return items, total


def update_notice(db: Database, notice_id: str, notice_in: NoticeUpdate) -> Optional[dict]:
    """Update fields of an existing notice document."""
    oid = _parse_object_id(notice_id)
    if not oid:
        return None

    update_data = notice_in.model_dump(exclude_unset=True)
    if not update_data:
        doc = db.notices.find_one({"_id": oid})
        return _doc_to_notice(doc)

    fields_to_set = {}
    for field, value in update_data.items():
        if value is not None:
            if field in ("category", "priority") and hasattr(value, "value"):
                fields_to_set[field] = value.value
            elif field == "event_date" and isinstance(value, date):
                fields_to_set[field] = value.isoformat()
            elif field == "event_time" and isinstance(value, time):
                fields_to_set[field] = value.isoformat()
            else:
                fields_to_set[field] = value

    fields_to_set["updated_at"] = datetime.now(timezone.utc)

    updated_doc = db.notices.find_one_and_update(
        {"_id": oid},
        {"$set": fields_to_set},
        return_document=ReturnDocument.AFTER,
    )
    return _doc_to_notice(updated_doc)


def delete_notice(db: Database, notice_id: str) -> bool:
    """Delete a notice document from MongoDB."""
    oid = _parse_object_id(notice_id)
    if not oid:
        return False
    res = db.notices.delete_one({"_id": oid})
    return res.deleted_count > 0
