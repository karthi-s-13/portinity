from sqlalchemy import Column, Integer, String, Date, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    company_logo = Column(Text, nullable=True)
    company_url = Column(String(500), nullable=True)
    employment_type = Column(String(100), nullable=True)
    skills_used = Column(String(500), nullable=True)
    achievements = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)

    user = relationship("User", back_populates="experiences")
