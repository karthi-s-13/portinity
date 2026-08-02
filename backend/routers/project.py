from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User
from models.project import Project
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Project).filter(
        Project.user_id == current_user.id
    ).order_by(Project.display_order).all()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = Project(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=ProjectResponse)
def update_project(
    entry_id: int,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Project).filter(
        Project.id == entry_id, Project.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entry = db.query(Project).filter(
        Project.id == entry_id, Project.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(entry)
    db.commit()
