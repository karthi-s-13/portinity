from pydantic import BaseModel
from typing import Optional
from datetime import date


class ExtracurricularCreate(BaseModel):
    title: str
    organization: Optional[str] = None
    category: Optional[str] = "Leadership"
    role: Optional[str] = None
    location: Optional[str] = "On Campus"
    skills: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = False
    url: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = 0


class ExtracurricularUpdate(BaseModel):
    title: Optional[str] = None
    organization: Optional[str] = None
    category: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    url: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None


class ExtracurricularResponse(BaseModel):
    id: int
    user_id: int
    title: str
    organization: Optional[str] = None
    category: Optional[str] = "Leadership"
    role: Optional[str] = None
    location: Optional[str] = "On Campus"
    skills: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = False
    url: Optional[str] = None
    description: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True

