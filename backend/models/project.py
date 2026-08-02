from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    tech_stack = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    repo_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    role = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    display_order = Column(Integer, default=0)

    user = relationship("User", back_populates="projects")
