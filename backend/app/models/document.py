from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class DocumentRecord(Base):
    __tablename__ = "document_records"

    id = Column(Integer, primary_key=True, index=True)
    inmate_id = Column(Integer, ForeignKey("inmates.id"), nullable=False, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True, index=True)
    document_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, default="MISSING")
    source = Column(String, nullable=True)
    document_date = Column(String, nullable=True)
    owner_role = Column(String, nullable=True)
    verification_note = Column(Text, nullable=True)
    is_required = Column(Boolean, default=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    inmate = relationship("Inmate", back_populates="documents")
    case = relationship("Case", back_populates="documents")
