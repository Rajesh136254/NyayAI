from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class BailApplication(Base):
    __tablename__ = "bail_applications"

    id = Column(Integer, primary_key=True, index=True)
    inmate_id = Column(Integer, ForeignKey("inmates.id"), nullable=False, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True, index=True)
    application_number = Column(String, nullable=True)
    application_type = Column(String, nullable=False)
    filed_date = Column(String, nullable=False)
    status = Column(String, default="UNDER_REVIEW")
    outcome_date = Column(String, nullable=True)
    court_name = Column(String, nullable=True)
    counsel = Column(String, nullable=True)
    order_reference = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inmate = relationship("Inmate", back_populates="bail_applications")
    case = relationship("Case", back_populates="bail_applications")
