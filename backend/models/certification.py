from sqlalchemy import Column, Integer, String, Date, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    issuing_org = Column(String(255), nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    credential_id = Column(String(255), nullable=True)
    credential_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    status = Column(String(50), default="Verified")
    media_url = Column(Text, nullable=True)
    does_not_expire = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

    user = relationship("User", back_populates="certifications")
