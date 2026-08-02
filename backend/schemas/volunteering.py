from pydantic import BaseModel
from typing import Optional
from datetime import date


class VolunteeringCreate(BaseModel):
    title: Optional[str] = None
    organization: str
    role: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    hours: Optional[int] = 0
    cause: Optional[str] = None
    status: Optional[str] = "Completed"
    url: Optional[str] = None
    impact_text: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = 0


class VolunteeringUpdate(BaseModel):
    title: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    hours: Optional[int] = None
    cause: Optional[str] = None
    status: Optional[str] = None
    url: Optional[str] = None
    impact_text: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None


class VolunteeringResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    organization: str
    role: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    hours: Optional[int] = 0
    cause: Optional[str] = None
    status: Optional[str] = "Completed"
    url: Optional[str] = None
    impact_text: Optional[str] = None
    description: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True

