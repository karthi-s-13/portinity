from pydantic import BaseModel
from typing import Optional
from datetime import date


class PublicationCreate(BaseModel):
    title: str
    description: Optional[str] = None
    publisher: Optional[str] = None
    publish_date: Optional[date] = None
    url: Optional[str] = None
    doi: Optional[str] = None
    pub_type: Optional[str] = "Journal Article"
    peer_reviewed: Optional[bool] = True
    volume_issue: Optional[str] = None
    authors: Optional[str] = None
    tags: Optional[str] = None
    citations: Optional[int] = 0
    pdf_url: Optional[str] = None
    display_order: Optional[int] = 0


class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    publisher: Optional[str] = None
    publish_date: Optional[date] = None
    url: Optional[str] = None
    doi: Optional[str] = None
    pub_type: Optional[str] = None
    peer_reviewed: Optional[bool] = None
    volume_issue: Optional[str] = None
    authors: Optional[str] = None
    tags: Optional[str] = None
    citations: Optional[int] = None
    pdf_url: Optional[str] = None
    display_order: Optional[int] = None


class PublicationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    publisher: Optional[str] = None
    publish_date: Optional[date] = None
    url: Optional[str] = None
    doi: Optional[str] = None
    pub_type: Optional[str] = "Journal Article"
    peer_reviewed: Optional[bool] = True
    volume_issue: Optional[str] = None
    authors: Optional[str] = None
    tags: Optional[str] = None
    citations: Optional[int] = 0
    pdf_url: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True

