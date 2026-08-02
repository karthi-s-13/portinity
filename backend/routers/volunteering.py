from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.volunteering import Volunteering
from schemas.volunteering import VolunteeringCreate, VolunteeringUpdate, VolunteeringResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/volunteering", tags=["Volunteering"])


@router.get("", response_model=List[VolunteeringResponse])
def list_volunteering(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Volunteering).filter(
        Volunteering.user_id == current_user.id
    ).order_by(Volunteering.display_order).all()


@router.post("", response_model=VolunteeringResponse, status_code=status.HTTP_201_CREATED)
def create_volunteering(
    data: VolunteeringCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = Volunteering(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=VolunteeringResponse)
def update_volunteering(
    entry_id: int,
    data: VolunteeringUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Volunteering).filter(
        Volunteering.id == entry_id, Volunteering.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Volunteering entry not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_volunteering(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Volunteering).filter(
        Volunteering.id == entry_id, Volunteering.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Volunteering entry not found")

    db.delete(entry)
    db.commit()
