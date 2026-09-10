from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class UtrcReview(Base):
    __tablename__ = "utrc_reviews"

    id = Column(Integer, primary_key=True, index=True)
    inmate_id = Column(Integer, ForeignKey("inmates.id"), nullable=False, index=True)
    review_date = Column(String, nullable=False)
    status = Column(String, default="DUE")
    priority = Column(String, default="ATTENTION")
    recommendation = Column(String, nullable=True)
    missing_item = Column(String, nullable=True)
    reviewed_by = Column(String, nullable=True)
    decision_date = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inmate = relationship("Inmate", back_populates="utrc_reviews")
