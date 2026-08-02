from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.skill import Skill
from schemas.skill import SkillCreate, SkillUpdate, SkillResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/skills", tags=["Skills"])


@router.get("", response_model=List[SkillResponse])
def list_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Skill).filter(
        Skill.user_id == current_user.id
    ).order_by(Skill.display_order).all()


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    data: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = Skill(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=SkillResponse)
def update_skill(
    entry_id: int,
    data: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Skill).filter(
        Skill.id == entry_id, Skill.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Skill not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Skill).filter(
        Skill.id == entry_id, Skill.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(entry)
    db.commit()
