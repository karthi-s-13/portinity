from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from database import Base


class ResumeHistory(Base):
    __tablename__ = "resume_histories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_description = Column(Text, nullable=False)
    target_role = Column(String(255), nullable=True)
    template_id = Column(String(50), nullable=True)
    experience_level = Column(String(100), nullable=True)
    latex_code = Column(Text, nullable=False)
    resume_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="resume_histories")
