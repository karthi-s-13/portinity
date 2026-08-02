from pydantic import BaseModel
from typing import Optional
from datetime import date


class EducationCreate(BaseModel):
    institution: str
    institution_logo: Optional[str] = None
    location: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    level: Optional[str] = None
    stream: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = False
    gpa: Optional[float] = None
    score_type: Optional[str] = None
    score_value: Optional[float] = None
    score_max: Optional[float] = None
    status: Optional[str] = None
    honors: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = 0


class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    institution_logo: Optional[str] = None
    location: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    level: Optional[str] = None
    stream: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    gpa: Optional[float] = None
    score_type: Optional[str] = None
    score_value: Optional[float] = None
    score_max: Optional[float] = None
    status: Optional[str] = None
    honors: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None


class EducationResponse(BaseModel):
    id: int
    user_id: int
    institution: str
    institution_logo: Optional[str] = None
    location: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    level: Optional[str] = None
    stream: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    gpa: Optional[float] = None
    score_type: Optional[str] = None
    score_value: Optional[float] = None
    score_max: Optional[float] = None
    status: Optional[str] = None
    honors: Optional[str] = None
    description: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True
