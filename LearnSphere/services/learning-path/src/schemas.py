from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class LearningPathBase(BaseModel):
    title: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    category: str
    level: str
    price: float = 0
    currency: str = "USD"
    duration_weeks: Optional[int] = None
    is_bestseller: bool = False
    courses: List[str] = []
    skills: List[str] = []


class LearningPathCreate(LearningPathBase):
    slug: str


class LearningPathResponse(LearningPathBase):
    id: UUID
    slug: str
    course_count: int
    enrolled_count: int
    is_published: bool
    thumbnail: Optional[str] = None
    color: Optional[str] = None
    icon_color: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LearningPathListResponse(BaseModel):
    paths: List[LearningPathResponse]
    total: int
    page: int
    pages: int
