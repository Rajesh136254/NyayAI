from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    inmate_id = Column(Integer, ForeignKey("inmates.id"), nullable=False)
    cnr = Column(String, nullable=True)  # Court case number
    court_name = Column(String, nullable=False)
    court_district = Column(String, nullable=True)
    bns_section = Column(String, nullable=False)  # e.g. "BNS 303(2)"
    offence_description = Column(String, nullable=False)
    max_sentence_years = Column(Float, nullable=False)
    is_life_sentence = Column(Integer, default=0)
    is_death_sentence = Column(Integer, default=0)
    case_stage = Column(String, default="TRIAL")  # INVESTIGATION / TRIAL / JUDGMENT
    filing_date = Column(String, nullable=True)

    inmate = relationship("Inmate", back_populates="cases")
    hearings = relationship("Hearing", back_populates="case", cascade="all, delete-orphan")
    documents = relationship("DocumentRecord", back_populates="case")
    bail_applications = relationship("BailApplication", back_populates="case")
    deadlines = relationship("Deadline", back_populates="case")
