from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .database import Base


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    short_description = Column(String(300))
    category = Column(String(100), nullable=False, index=True)
    level = Column(String(50), nullable=False)
    price = Column(Float, nullable=False, default=0)
    currency = Column(String(10), default="USD")
    duration_weeks = Column(Integer)
    course_count = Column(Integer, default=0)
    enrolled_count = Column(Integer, default=0)
    is_bestseller = Column(Boolean, default=False, index=True)
    is_published = Column(Boolean, default=False, index=True)
    thumbnail = Column(String(500))
    color = Column(String(50))
    icon_color = Column(String(50))
    courses = Column(JSON, default=list)  # ordered list of course IDs
    skills = Column(JSON, default=list)
    prerequisites = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)
