from datetime import date, time, datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field, field_validator, ConfigDict


class NoticeCategory(str, Enum):
    ASSIGNMENT = "Assignment"
    EXAMINATION = "Examination"
    EVENT = "Event"
    HOLIDAY = "Holiday"
    GENERAL = "General"


class NoticePriority(str, Enum):
    NORMAL = "Normal"
    IMPORTANT = "Important"
    URGENT = "Urgent"


class NoticeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Notice title")
    description: Optional[str] = Field(None, max_length=5000, description="Original notice text")
    category: NoticeCategory = Field(default=NoticeCategory.GENERAL, description="Notice category")
    event_date: date = Field(..., description="Event or deadline date")
    event_time: Optional[time] = Field(None, description="Event or deadline time")
    venue: Optional[str] = Field(None, max_length=200, description="Location")
    priority: NoticePriority = Field(default=NoticePriority.NORMAL, description="Notice priority")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Notice title cannot be empty or only whitespace")
        return stripped

    @field_validator("venue")
    @classmethod
    def validate_venue(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            return stripped if stripped else None
        return None

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            return stripped if stripped else None
        return None


class NoticeCreate(NoticeBase):
    pass


class NoticeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    category: Optional[NoticeCategory] = None
    event_date: Optional[date] = None
    event_time: Optional[time] = None
    venue: Optional[str] = Field(None, max_length=200)
    priority: Optional[NoticePriority] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            stripped = v.strip()
            if not stripped:
                raise ValueError("Notice title cannot be empty or only whitespace")
            return stripped
        return None


class NoticeResponse(NoticeBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NoticeListResponse(BaseModel):
    items: List[NoticeResponse]
    total: int
    page: int
    limit: int


class NoticeExtractRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Raw announcement text")

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Announcement text cannot be empty or only whitespace")
        return stripped


class NoticeExtractResponse(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    event_date: Optional[date] = None
    event_time: Optional[time] = None
    venue: Optional[str] = Field(None, max_length=200)
    category: NoticeCategory = Field(default=NoticeCategory.GENERAL)
    priority: NoticePriority = Field(default=NoticePriority.NORMAL)
    description: Optional[str] = Field(None, max_length=5000)
