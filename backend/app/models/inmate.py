from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Inmate(Base):
    __tablename__ = "inmates"

    id = Column(Integer, primary_key=True, index=True)
    prisoner_id = Column(String, unique=True, index=True, nullable=False)  # e.g. KA/CP/2023/047
    name = Column(String, nullable=False)
    dob = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    prison_name = Column(String, nullable=False)
    prison_district = Column(String, nullable=False)
    arrest_date = Column(String, nullable=False)  # ISO date string
    is_first_offender = Column(Boolean, default=True)
    has_life_death_case = Column(Boolean, default=False)
    multi_case_flag = Column(Boolean, default=False)
    overall_status = Column(String, default="UNDER_REVIEW")
    # eligible / ineligible / borderline / excluded / action_required
    workflow_stage = Column(String, default="IDENTIFIED")
    # IDENTIFIED / VERIFIED / ASSIGNED / DRAFTED / REVIEWED / FILED / OUTCOME
    assigned_lawyer = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cases = relationship("Case", back_populates="inmate", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="inmate", cascade="all, delete-orphan")
    documents = relationship("DocumentRecord", back_populates="inmate", cascade="all, delete-orphan")
    bail_applications = relationship("BailApplication", back_populates="inmate", cascade="all, delete-orphan")
    utrc_reviews = relationship("UtrcReview", back_populates="inmate", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="inmate", cascade="all, delete-orphan")
