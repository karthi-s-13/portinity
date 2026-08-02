from pydantic import BaseModel
from typing import Optional
from datetime import date


class CertificationCreate(BaseModel):
    title: str
    issuing_org: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = "Verified"
    media_url: Optional[str] = None
    does_not_expire: Optional[bool] = True
    display_order: Optional[int] = 0


class CertificationUpdate(BaseModel):
    title: Optional[str] = None
    issuing_org: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    media_url: Optional[str] = None
    does_not_expire: Optional[bool] = None
    display_order: Optional[int] = None


class CertificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    issuing_org: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = "Verified"
    media_url: Optional[str] = None
    does_not_expire: Optional[bool] = True
    display_order: int

    class Config:
        from_attributes = True
