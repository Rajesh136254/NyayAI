from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    inmate_id = Column(Integer, ForeignKey("inmates.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    step_title = Column(String, nullable=False)
    step_description = Column(Text, nullable=True)
    status = Column(String, default="PENDING")  # PENDING / IN_PROGRESS / COMPLETED / SKIPPED
    assigned_role = Column(String, nullable=True)
    assigned_user = Column(String, nullable=True)
    completed_by = Column(String, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    inmate = relationship("Inmate", back_populates="action_items")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_email = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    action = Column(String, nullable=False)  # VIEW / MODIFY / EXPORT / LOGIN / LOGOUT
    resource_type = Column(String, nullable=True)  # INMATE / CASE / ACTION_ITEM
    resource_id = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
