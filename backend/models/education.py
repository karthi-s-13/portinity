from sqlalchemy import Column, Integer, String, Date, Float, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Core fields
    institution = Column(String(255), nullable=False)
    institution_logo = Column(Text, nullable=True)   # URL or relative path
    location = Column(String(255), nullable=True)            # City, State, Country
    degree = Column(String(255), nullable=True)
    field_of_study = Column(String(255), nullable=True)

    # Level / type
    level = Column(String(100), nullable=True)               # Undergraduate, Postgraduate, Higher Secondary, etc.
    stream = Column(String(100), nullable=True)              # PCMC, PCB, etc. (non-degree streams)

    # Dates
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)

    # Score / GPA
    gpa = Column(Float, nullable=True)                       # Kept for backwards compat
    score_type = Column(String(50), nullable=True)           # "CGPA" | "Percentage" | "GPA"
    score_value = Column(Float, nullable=True)
    score_max = Column(Float, nullable=True)                 # e.g. 10.0 or 100

    # Status & honors
    status = Column(String(100), nullable=True)              # "Currently Pursuing", "Completed", etc.
    honors = Column(Text, nullable=True)                     # Comma-separated list of honors

    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)

    user = relationship("User", back_populates="educations")
