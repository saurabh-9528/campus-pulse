from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Request, status
from pymongo.database import Database

from app.database.connection import get_db
from app.core.security import extract_rate_limiter
from app.schemas.notice import (
    NoticeCreate,
    NoticeUpdate,
    NoticeResponse,
    NoticeListResponse,
    NoticeExtractRequest,
    NoticeExtractResponse,
)
from app.services import notice_service
from app.services import ai_service

router = APIRouter(prefix="/notices", tags=["notices"])


@router.post(
    "/extract",
    response_model=NoticeExtractResponse,
    status_code=status.HTTP_200_OK,
    summary="Extract structured notice details from unstructured text",
)
async def extract_notice(
    body: NoticeExtractRequest,
    req: Request,
):
    """Parse unstructured notice text using AI into editable preview fields with rate limiting."""
    client_ip = req.client.host if req.client else "127.0.0.1"
    if not extract_rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait a moment before requesting another extraction.",
        )

    return await ai_service.extract_notice_from_text(body.text)


@router.post(
    "",
    response_model=NoticeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new notice",
)
def create_notice(
    notice_in: NoticeCreate,
    db: Database = Depends(get_db),
):
    """Save and persist a validated college notice in MongoDB."""
    return notice_service.create_notice(db=db, notice_in=notice_in)


@router.get(
    "",
    response_model=NoticeListResponse,
    summary="List and filter notices",
)
def list_notices(
    search: Optional[str] = Query(None, max_length=100, description="Keyword search term"),
    category: Optional[str] = Query(None, max_length=50, description="Category filter"),
    priority: Optional[str] = Query(None, max_length=20, description="Priority filter"),
    start_date: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Database = Depends(get_db),
):
    """Retrieve saved notices with optional searching, filtering, and pagination from MongoDB."""
    items, total = notice_service.list_notices(
        db=db,
        search=search,
        category=category,
        priority=priority,
        start_date=start_date,
        end_date=end_date,
        page=page,
        limit=limit,
    )
    return NoticeListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.get(
    "/{notice_id}",
    response_model=NoticeResponse,
    summary="Get notice details by ID",
)
def get_notice(
    notice_id: str = Path(..., min_length=1, max_length=50, description="Notice ID"),
    db: Database = Depends(get_db),
):
    """Retrieve an individual notice by its unique ID."""
    notice = notice_service.get_notice_by_id(db=db, notice_id=notice_id)
    if not notice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notice with ID {notice_id} not found",
        )
    return notice


@router.put(
    "/{notice_id}",
    response_model=NoticeResponse,
    summary="Update an existing notice",
)
def update_notice(
    notice_in: NoticeUpdate,
    notice_id: str = Path(..., min_length=1, max_length=50, description="Notice ID"),
    db: Database = Depends(get_db),
):
    """Update fields on an existing notice in MongoDB."""
    updated_notice = notice_service.update_notice(db=db, notice_id=notice_id, notice_in=notice_in)
    if not updated_notice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notice with ID {notice_id} not found",
        )
    return updated_notice


@router.delete(
    "/{notice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a notice",
)
def delete_notice(
    notice_id: str = Path(..., min_length=1, max_length=50, description="Notice ID"),
    db: Database = Depends(get_db),
):
    """Delete a notice by ID from MongoDB."""
    deleted = notice_service.delete_notice(db=db, notice_id=notice_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notice with ID {notice_id} not found",
        )
    return None
