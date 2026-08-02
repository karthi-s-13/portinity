from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.extracurricular import Extracurricular
from schemas.extracurricular import ExtracurricularCreate, ExtracurricularUpdate, ExtracurricularResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/extracurricular", tags=["Extracurricular"])


@router.get("", response_model=List[ExtracurricularResponse])
def list_extracurricular(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Extracurricular).filter(
        Extracurricular.user_id == current_user.id
    ).order_by(Extracurricular.display_order).all()


@router.post("", response_model=ExtracurricularResponse, status_code=status.HTTP_201_CREATED)
def create_extracurricular(
    data: ExtracurricularCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = Extracurricular(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=ExtracurricularResponse)
def update_extracurricular(
    entry_id: int,
    data: ExtracurricularUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Extracurricular).filter(
        Extracurricular.id == entry_id, Extracurricular.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Extracurricular entry not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_extracurricular(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Extracurricular).filter(
        Extracurricular.id == entry_id, Extracurricular.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Extracurricular entry not found")

    db.delete(entry)
    db.commit()
