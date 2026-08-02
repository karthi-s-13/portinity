from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.achievement import Achievement
from schemas.achievement import AchievementCreate, AchievementUpdate, AchievementResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/achievements", tags=["Achievements"])


@router.get("", response_model=List[AchievementResponse])
def list_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Achievement).filter(
        Achievement.user_id == current_user.id
    ).order_by(Achievement.display_order).all()


@router.post("", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def create_achievement(
    data: AchievementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = Achievement(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=AchievementResponse)
def update_achievement(
    entry_id: int,
    data: AchievementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Achievement).filter(
        Achievement.id == entry_id, Achievement.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Achievement not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Achievement).filter(
        Achievement.id == entry_id, Achievement.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Achievement not found")

    db.delete(entry)
    db.commit()
