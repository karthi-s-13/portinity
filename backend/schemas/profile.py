from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProfileCreate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    languages: Optional[str] = None
    leetcode: Optional[str] = None


class ProfileUpdate(ProfileCreate):
    pass


class ProfileResponse(ProfileCreate):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
