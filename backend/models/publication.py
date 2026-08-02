from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    publisher = Column(String(255), nullable=True)
    publish_date = Column(Date, nullable=True)
    url = Column(String(500), nullable=True)
    doi = Column(String(255), nullable=True)
    pub_type = Column(String(100), default="Journal Article")
    peer_reviewed = Column(Boolean, default=True)
    volume_issue = Column(String(255), nullable=True)
    authors = Column(String(255), nullable=True)
    tags = Column(String(500), nullable=True)
    citations = Column(Integer, default=0)
    pdf_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)

    user = relationship("User", back_populates="publications")

