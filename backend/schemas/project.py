from pydantic import BaseModel
from typing import Optional
from datetime import date


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    live_url: Optional[str] = None
    repo_url: Optional[str] = None
    image_url: Optional[str] = None
    role: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    display_order: Optional[int] = 0


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    live_url: Optional[str] = None
    repo_url: Optional[str] = None
    image_url: Optional[str] = None
    role: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    display_order: Optional[int] = None


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    live_url: Optional[str] = None
    repo_url: Optional[str] = None
    image_url: Optional[str] = None
    role: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    display_order: int

    class Config:
        from_attributes = True
