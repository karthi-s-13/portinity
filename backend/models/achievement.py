from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=True)
    issuer = Column(String(255), nullable=True)
    achievement_type = Column(String(100), default="Award")
    category = Column(String(100), default="Technical")
    tags = Column(String(500), nullable=True)
    media_url = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)

    user = relationship("User", back_populates="achievements")
