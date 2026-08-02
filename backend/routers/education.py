from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.education import Education
from schemas.education import EducationCreate, EducationUpdate, EducationResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/education", tags=["Education"])


@router.get("", response_model=List[EducationResponse])
def list_education(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Education).filter(
        Education.user_id == current_user.id
    ).order_by(Education.display_order).all()


@router.post("", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def create_education(
    data: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = Education(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=EducationResponse)
def update_education(
    entry_id: int,
    data: EducationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Education).filter(
        Education.id == entry_id, Education.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Education entry not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Education).filter(
        Education.id == entry_id, Education.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Education entry not found")

    db.delete(entry)
    db.commit()
