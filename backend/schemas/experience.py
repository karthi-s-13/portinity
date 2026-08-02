from pydantic import BaseModel
from typing import Optional
from datetime import date


class ExperienceCreate(BaseModel):
    company: str
    role: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = False
    description: Optional[str] = None
    company_logo: Optional[str] = None
    company_url: Optional[str] = None
    employment_type: Optional[str] = None
    skills_used: Optional[str] = None
    achievements: Optional[str] = None
    display_order: Optional[int] = 0


class ExperienceUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    company_logo: Optional[str] = None
    company_url: Optional[str] = None
    employment_type: Optional[str] = None
    skills_used: Optional[str] = None
    achievements: Optional[str] = None
    display_order: Optional[int] = None


class ExperienceResponse(BaseModel):
    id: int
    user_id: int
    company: str
    role: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool
    description: Optional[str] = None
    company_logo: Optional[str] = None
    company_url: Optional[str] = None
    employment_type: Optional[str] = None
    skills_used: Optional[str] = None
    achievements: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True
