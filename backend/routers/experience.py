from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.experience import Experience
from schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/experience", tags=["Experience"])


@router.get("", response_model=List[ExperienceResponse])
def list_experience(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Experience).filter(
        Experience.user_id == current_user.id
    ).order_by(Experience.display_order).all()


@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(
    data: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = Experience(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=ExperienceResponse)
def update_experience(
    entry_id: int,
    data: ExperienceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Experience).filter(
        Experience.id == entry_id, Experience.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Experience entry not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Experience).filter(
        Experience.id == entry_id, Experience.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Experience entry not found")

    db.delete(entry)
    db.commit()
