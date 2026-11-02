from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from uuid import UUID

from ..database import get_db
from ..models import LearningPath
from ..schemas import LearningPathCreate, LearningPathResponse, LearningPathListResponse

router = APIRouter()


@router.get("/", response_model=LearningPathListResponse)
async def list_paths(
    category: Optional[str] = None,
    level: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=48),
    db: AsyncSession = Depends(get_db),
):
    filters = [LearningPath.is_published == True]
    if category:
        filters.append(LearningPath.category == category)
    if level:
        filters.append(LearningPath.level == level)

    total_q = await db.execute(select(func.count()).where(*filters))
    total = total_q.scalar()

    result = await db.execute(
        select(LearningPath)
        .where(*filters)
        .order_by(LearningPath.enrolled_count.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    paths = result.scalars().all()

    return {"paths": paths, "total": total, "page": page, "pages": max(1, -(-total // limit))}


@router.get("/{path_id}", response_model=LearningPathResponse)
async def get_path(path_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = result.scalar_one_or_none()
    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found")
    return path


@router.post("/", response_model=LearningPathResponse, status_code=201)
async def create_path(data: LearningPathCreate, db: AsyncSession = Depends(get_db)):
    path = LearningPath(**data.model_dump())
    db.add(path)
    await db.commit()
    await db.refresh(path)
    return path


@router.patch("/{path_id}", response_model=LearningPathResponse)
async def update_path(path_id: UUID, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LearningPath).where(LearningPath.id == path_id))
    path = result.scalar_one_or_none()
    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found")
    for k, v in data.items():
        setattr(path, k, v)
    await db.commit()
    await db.refresh(path)
    return path
