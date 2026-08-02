from pydantic import BaseModel
from typing import Optional
from datetime import date


class AchievementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[date] = None
    issuer: Optional[str] = None
    achievement_type: Optional[str] = "Award"
    category: Optional[str] = "Technical"
    tags: Optional[str] = None
    media_url: Optional[str] = None
    display_order: Optional[int] = 0


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    issuer: Optional[str] = None
    achievement_type: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    media_url: Optional[str] = None
    display_order: Optional[int] = None


class AchievementResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    date: Optional[date] = None
    issuer: Optional[str] = None
    achievement_type: Optional[str] = "Award"
    category: Optional[str] = "Technical"
    tags: Optional[str] = None
    media_url: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True
