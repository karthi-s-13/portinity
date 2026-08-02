from pydantic import BaseModel
from typing import Optional


class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None
    proficiency: Optional[str] = None
    display_order: Optional[int] = 0


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[str] = None
    display_order: Optional[int] = None


class SkillResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category: Optional[str] = None
    proficiency: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True
