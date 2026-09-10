from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    inmate_id = Column(Integer, ForeignKey("inmates.id"), nullable=False, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True, index=True)
    deadline_type = Column(String, nullable=False)
    due_date = Column(String, nullable=False)
    status = Column(String, default="OPEN")
    priority = Column(String, default="ATTENTION")
    owner_role = Column(String, nullable=True)
    action = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inmate = relationship("Inmate", back_populates="deadlines")
    case = relationship("Case", back_populates="deadlines")
