from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Volunteering(Base):
    __tablename__ = "volunteerings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=True)
    organization = Column(String(255), nullable=False)
    role = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    hours = Column(Integer, default=0)
    cause = Column(String(255), nullable=True)
    status = Column(String(100), default="Completed")
    url = Column(String(500), nullable=True)
    impact_text = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)

    user = relationship("User", back_populates="volunteerings")

