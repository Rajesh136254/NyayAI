from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Hearing(Base):
    __tablename__ = "hearings"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    hearing_date = Column(String, nullable=False)  # ISO date
    outcome = Column(String, nullable=False)  # ADJOURNED / HEARD / JUDGMENT / BAIL_ORDER / CHARGE_FRAMED
    adjournment_reason = Column(String, nullable=True)
    # PROSECUTION_ABSENT / DEFENCE_ABSENT / WITNESS_ABSENT / ADMINISTRATIVE / COURT_HOLIDAY / OTHER
    next_date = Column(String, nullable=True)
    is_excluded_from_custody = Column(Boolean, default=False)
    # True if delay was caused by defence → excluded from effective custody calc
    days_excluded = Column(Integer, default=0)
    order_reference = Column(String, nullable=True)  # e.g. "Order #17, Page 4"
    notes = Column(Text, nullable=True)

    case = relationship("Case", back_populates="hearings")
