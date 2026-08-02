from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Extracurricular(Base):
    __tablename__ = "extracurriculars"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    organization = Column(String(255), nullable=True)
    category = Column(String(100), default="Leadership")
    role = Column(String(255), nullable=True)
    location = Column(String(255), default="On Campus")
    skills = Column(String(500), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)

    user = relationship("User", back_populates="extracurriculars")

