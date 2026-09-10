"""
NYAYAI Seed Data Script
Generates 10 synthetic, anonymized undertrial cases with realistic
hearing records, adjournment patterns, and Section 479 diversity.

Run from backend/ directory: python seed.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.inmate import Inmate
from app.models.case import Case
from app.models.hearing import Hearing
from app.models.action_item import ActionItem, AuditLog
from app.models.document import DocumentRecord
from app.models.bail_application import BailApplication
from app.models.utrc_review import UtrcReview
from app.models.deadline import Deadline
from datetime import datetime

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def clear_data():
    db.query(Deadline).delete()
    db.query(UtrcReview).delete()
    db.query(BailApplication).delete()
    db.query(DocumentRecord).delete()
    db.query(ActionItem).delete()
    db.query(AuditLog).delete()
    db.query(Hearing).delete()
    db.query(Case).delete()
    db.query(Inmate).delete()
    db.query(User).delete()
    db.commit()
    print("âœ“ Cleared existing data")


def seed_users():
    users = [
        User(
            email="superintendent@karnataka.gov.in",
            name="Supt. Ramakrishna Naidu",
            hashed_password=get_password_hash("nyayai@123"),
            role="SUPERINTENDENT",
            prison_id="KA-BLR-CP-001",
            district="Bengaluru Central",
            is_active=1
        ),
        User(
            email="lawyer@dlsa.karnataka.gov.in",
            name="Adv. Meenakshi Pillai",
            hashed_password=get_password_hash("nyayai@123"),
            role="DLSA_LAWYER",
            prison_id=None,
            district="Bengaluru",
            is_active=1
        ),
        User(
            email="admin@slsa.karnataka.gov.in",
            name="Dir. Prashant Verma",
            hashed_password=get_password_hash("nyayai@123"),
            role="STATE_ADMIN",
            prison_id=None,
            district="Karnataka",
            is_active=1
        ),
        User(
            email="sysadmin@nyayai.in",
            name="System Administrator",
            hashed_password=get_password_hash("admin@nyayai123"),
            role="SYSTEM_ADMIN",
            prison_id=None,
            district=None,
            is_active=1
        ),
    ]
    db.add_all(users)
    db.commit()
    print(f"âœ“ Created {len(users)} users")
    return users


def seed_inmates():
    inmates_data = [
        # 1. ELIGIBLE - Simple theft, first offender, clear threshold met
        {
            "prisoner_id": "KA/BLR/CP/2023/047",
            "name": "Ramesh Kumar",
            "dob": "1985-06-12",
            "gender": "Male",
            "prison_name": "Bengaluru Central Prison",
            "prison_district": "Bengaluru",
            "arrest_date": "2023-01-15",
            "is_first_offender": True,
            "has_life_death_case": False,
            "multi_case_flag": False,
            "overall_status": "ELIGIBLE",
            "workflow_stage": "IDENTIFIED",
            "cases": [
                {
                    "cnr": "KABL020012342023",
                    "court_name": "II Additional JMFC, Bengaluru",
                    "court_district": "Bengaluru",
                    "bns_section": "BNS 303(2)",
                    "offence_description": "Theft â€” stolen goods from commercial establishment",
                    "max_sentence_years": 3.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2023-01-30",
                    "hearings": [
                        {"date": "2023-02-15", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2023-03-10", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2023-04-12", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #3"},
                        {"date": "2023-05-08", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2023-06-14", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #5"},
                        {"date": "2023-07-20", "outcome": "ADJOURNED", "reason": "DEFENCE_ABSENT", "excl": True, "days_excl": 15, "ref": "Order #6"},
                        {"date": "2023-09-05", "outcome": "ADJOURNED", "reason": "ADMINISTRATIVE", "excl": False, "days_excl": 0, "ref": "Order #7"},
                        {"date": "2023-10-18", "outcome": "ADJOURNED", "reason": "PROSECUTION_WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #8"},
                        {"date": "2023-12-07", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #9"},
                        {"date": "2024-02-14", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #10"},
                        {"date": "2024-04-22", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #11"},
                        {"date": "2024-07-09", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #12"},
                    ]
                }
            ],
            "action_items": [
                {"step": 1, "title": "Verify previous conviction status", "role": "SUPERINTENDENT", "status": "PENDING"},
                {"step": 2, "title": "Obtain latest court order", "role": "SUPERINTENDENT", "status": "PENDING"},
            ]
        },
        # 2. EXCLUDED - Attempted murder, life sentence option
        {
            "prisoner_id": "KA/MYS/CP/2022/112",
            "name": "Suresh Nair",
            "dob": "1978-03-25",
            "gender": "Male",
            "prison_name": "Mysuru Central Prison",
            "prison_district": "Mysuru",
            "arrest_date": "2022-06-01",
            "is_first_offender": False,
            "has_life_death_case": True,
            "multi_case_flag": False,
            "overall_status": "EXCLUDED",
            "workflow_stage": "IDENTIFIED",
            "cases": [
                {
                    "cnr": "KAMY020056782022",
                    "court_name": "Sessions Court, Mysuru",
                    "court_district": "Mysuru",
                    "bns_section": "BNS 109",
                    "offence_description": "Attempt to murder â€” assault with deadly weapon",
                    "max_sentence_years": 99.0,  # Life
                    "is_life_sentence": 1,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2022-06-20",
                    "hearings": [
                        {"date": "2022-08-10", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2022-10-05", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2023-01-12", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #3"},
                        {"date": "2023-04-18", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2023-07-22", "outcome": "ADJOURNED", "reason": "ADMINISTRATIVE", "excl": False, "days_excl": 0, "ref": "Order #5"},
                        {"date": "2023-11-09", "outcome": "ADJOURNED", "reason": "PROSECUTION_WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #6"},
                    ]
                }
            ],
            "action_items": []
        },
        # 3. ELIGIBLE - Cheating case, female undertrial
        {
            "prisoner_id": "KA/DWD/CP/2022/089",
            "name": "Anita Bai",
            "dob": "1992-11-08",
            "gender": "Female",
            "prison_name": "Dharwad District Prison",
            "prison_district": "Dharwad",
            "arrest_date": "2022-11-20",
            "is_first_offender": True,
            "has_life_death_case": False,
            "multi_case_flag": False,
            "overall_status": "ELIGIBLE",
            "workflow_stage": "VERIFIED",
            "assigned_lawyer": "Adv. Meenakshi Pillai",
            "cases": [
                {
                    "cnr": "KADW020034562022",
                    "court_name": "JMFC Court, Dharwad",
                    "court_district": "Dharwad",
                    "bns_section": "BNS 318(4)",
                    "offence_description": "Cheating â€” fraudulent financial transaction",
                    "max_sentence_years": 7.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2022-12-05",
                    "hearings": [
                        {"date": "2023-01-08", "outcome": "ADJOURNED", "reason": "ADMINISTRATIVE", "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2023-02-22", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2023-04-10", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #3"},
                        {"date": "2023-06-14", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2023-09-19", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #5"},
                        {"date": "2023-12-04", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #6"},
                        {"date": "2024-03-11", "outcome": "ADJOURNED", "reason": "DEFENCE_ABSENT", "excl": True, "days_excl": 20, "ref": "Order #7"},
                        {"date": "2024-06-17", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #8"},
                    ]
                }
            ],
            "action_items": [
                {"step": 1, "title": "Verify previous conviction status", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 2, "title": "Obtain latest court order", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 3, "title": "Assign DLSA panel lawyer", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 4, "title": "Review AI-generated draft petition", "role": "DLSA_LAWYER", "status": "PENDING"},
            ]
        },
        # 4. INELIGIBLE - High delay rate but not enough time served
        {
            "prisoner_id": "KA/HVR/CP/2023/201",
            "name": "Mohammed Rafiq",
            "dob": "1995-07-19",
            "gender": "Male",
            "prison_name": "Haveri District Prison",
            "prison_district": "Haveri",
            "arrest_date": "2023-03-10",
            "is_first_offender": True,
            "has_life_death_case": False,
            "multi_case_flag": False,
            "overall_status": "INELIGIBLE",
            "workflow_stage": "IDENTIFIED",
            "cases": [
                {
                    "cnr": "KAHV020009872023",
                    "court_name": "JMFC Court, Haveri",
                    "court_district": "Haveri",
                    "bns_section": "BNS 332(c)",
                    "offence_description": "Housebreaking and theft by night",
                    "max_sentence_years": 3.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2023-03-25",
                    "hearings": [
                        {"date": "2023-04-18", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2023-05-30", "outcome": "ADJOURNED", "reason": "DEFENCE_ABSENT", "excl": True, "days_excl": 30, "ref": "Order #2"},
                        {"date": "2023-07-10", "outcome": "ADJOURNED", "reason": "DEFENCE_ABSENT", "excl": True, "days_excl": 25, "ref": "Order #3"},
                        {"date": "2023-09-05", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2023-11-14", "outcome": "ADJOURNED", "reason": "ADMINISTRATIVE", "excl": False, "days_excl": 0, "ref": "Order #5"},
                    ]
                }
            ],
            "action_items": []
        },
        # 5. EXCLUDED - NDPS / Drug case
        {
            "prisoner_id": "KA/BLR/CP/2021/334",
            "name": "Prakash Gowda",
            "dob": "1980-12-30",
            "gender": "Male",
            "prison_name": "Bengaluru Central Prison",
            "prison_district": "Bengaluru",
            "arrest_date": "2021-08-05",
            "is_first_offender": False,
            "has_life_death_case": False,
            "multi_case_flag": False,
            "overall_status": "EXCLUDED",
            "workflow_stage": "IDENTIFIED",
            "notes": "NDPS case â€” special provisions apply, Section 479 standard thresholds not applicable",
            "cases": [
                {
                    "cnr": "KABL020078902021",
                    "court_name": "Special NDPS Court, Bengaluru",
                    "court_district": "Bengaluru",
                    "bns_section": "NDPS 21(c)",
                    "offence_description": "Possession and trafficking of controlled substance (commercial quantity)",
                    "max_sentence_years": 10.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2021-08-20",
                    "hearings": [
                        {"date": "2021-10-12", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2022-01-18", "outcome": "ADJOURNED", "reason": "PROSECUTION_WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2022-04-25", "outcome": "ADJOURNED", "reason": "PROSECUTION_WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #3"},
                        {"date": "2022-08-10", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2022-12-05", "outcome": "ADJOURNED", "reason": "ADMINISTRATIVE", "excl": False, "days_excl": 0, "ref": "Order #5"},
                        {"date": "2023-03-22", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #6"},
                        {"date": "2023-07-14", "outcome": "ADJOURNED", "reason": "PROSECUTION_WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #7"},
                        {"date": "2024-01-09", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #8"},
                    ]
                }
            ],
            "action_items": []
        },
        # 6. ELIGIBLE - Forgery case, female
        {
            "prisoner_id": "KA/KLB/CP/2022/067",
            "name": "Kavitha Reddy",
            "dob": "1988-04-02",
            "gender": "Female",
            "prison_name": "Kalaburagi District Prison",
            "prison_district": "Kalaburagi",
            "arrest_date": "2022-04-18",
            "is_first_offender": True,
            "has_life_death_case": False,
            "multi_case_flag": False,
            "overall_status": "ELIGIBLE",
            "workflow_stage": "DRAFTED",
            "assigned_lawyer": "Adv. Venkatesh Rao",
            "cases": [
                {
                    "cnr": "KAKL020023412022",
                    "court_name": "Sessions Court, Kalaburagi",
                    "court_district": "Kalaburagi",
                    "bns_section": "BNS 336(3)",
                    "offence_description": "Forgery of valuable documents â€” government certificate fraud",
                    "max_sentence_years": 7.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2022-05-03",
                    "hearings": [
                        {"date": "2022-06-08", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2022-08-10", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2022-10-12", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #3"},
                        {"date": "2023-01-16", "outcome": "ADJOURNED", "reason": "COVID_FORCE_MAJEURE", "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2023-04-20", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #5"},
                        {"date": "2023-07-25", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #6"},
                        {"date": "2023-10-30", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #7"},
                        {"date": "2024-01-15", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #8"},
                        {"date": "2024-04-22", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #9"},
                    ]
                }
            ],
            "action_items": [
                {"step": 1, "title": "Verify previous conviction status", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 2, "title": "Obtain latest court order", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 3, "title": "Assign DLSA panel lawyer", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 4, "title": "Review AI-generated draft petition", "role": "DLSA_LAWYER", "status": "IN_PROGRESS"},
            ]
        },
        # 7. MULTI_CASE_REVIEW - Assault + criminal trespass (2 cases)
        {
            "prisoner_id": "KA/BLR/CP/2023/156",
            "name": "Ravi Shankar",
            "dob": "2001-09-15",
            "gender": "Male",
            "prison_name": "Bengaluru Central Prison",
            "prison_district": "Bengaluru",
            "arrest_date": "2023-07-22",
            "is_first_offender": True,
            "has_life_death_case": False,
            "multi_case_flag": True,
            "overall_status": "MULTI_CASE_REVIEW",
            "workflow_stage": "IDENTIFIED",
            "cases": [
                {
                    "cnr": "KABL020045672023",
                    "court_name": "JMFC Court, Bengaluru",
                    "court_district": "Bengaluru",
                    "bns_section": "BNS 115(2)",
                    "offence_description": "Voluntarily causing grievous hurt by dangerous weapons",
                    "max_sentence_years": 3.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2023-07-30",
                    "hearings": [
                        {"date": "2023-08-22", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2023-10-05", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2023-12-11", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #3"},
                        {"date": "2024-02-19", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2024-05-07", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #5"},
                    ]
                },
                {
                    "cnr": "KABL020045682023",
                    "court_name": "IV JMFC Court, Bengaluru",
                    "court_district": "Bengaluru",
                    "bns_section": "BNS 329(3)",
                    "offence_description": "Criminal trespass â€” unlawful entry into property",
                    "max_sentence_years": 2.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2023-08-05",
                    "hearings": [
                        {"date": "2023-09-12", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2023-11-08", "outcome": "ADJOURNED", "reason": "ADMINISTRATIVE", "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2024-01-22", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #3"},
                        {"date": "2024-04-10", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #4"},
                    ]
                }
            ],
            "action_items": [
                {"step": 1, "title": "Verify all linked cases", "role": "SUPERINTENDENT", "status": "PENDING"},
                {"step": 2, "title": "Verify previous conviction status", "role": "SUPERINTENDENT", "status": "PENDING"},
            ]
        },
        # 8. BORDERLINE - Conspiracy case, nearly at threshold
        {
            "prisoner_id": "KA/BGM/CP/2022/145",
            "name": "Farida Begum",
            "dob": "1975-02-18",
            "gender": "Female",
            "prison_name": "Belagavi District Prison",
            "prison_district": "Belagavi",
            "arrest_date": "2022-09-30",
            "is_first_offender": True,
            "has_life_death_case": False,
            "multi_case_flag": False,
            "overall_status": "BORDERLINE",
            "workflow_stage": "IDENTIFIED",
            "cases": [
                {
                    "cnr": "KABG020067892022",
                    "court_name": "Sessions Court, Belagavi",
                    "court_district": "Belagavi",
                    "bns_section": "BNS 61",
                    "offence_description": "Criminal conspiracy â€” conspiracy to commit robbery",
                    "max_sentence_years": 7.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2022-10-18",
                    "hearings": [
                        {"date": "2022-11-14", "outcome": "ADJOURNED", "reason": "ADMINISTRATIVE", "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2023-01-20", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2023-03-28", "outcome": "ADJOURNED", "reason": "DEFENCE_ABSENT", "excl": True, "days_excl": 45, "ref": "Order #3"},
                        {"date": "2023-06-12", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2023-09-04", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #5"},
                        {"date": "2023-12-18", "outcome": "ADJOURNED", "reason": "DEFENCE_ABSENT", "excl": True, "days_excl": 30, "ref": "Order #6"},
                        {"date": "2024-04-09", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #7"},
                    ]
                }
            ],
            "action_items": []
        },
        # 9. ELIGIBLE - Robbery, simple case
        {
            "prisoner_id": "KA/MNG/CP/2022/234",
            "name": "Dinesh Patel",
            "dob": "1990-08-07",
            "gender": "Male",
            "prison_name": "Mangaluru District Prison",
            "prison_district": "Dakshina Kannada",
            "arrest_date": "2022-12-01",
            "is_first_offender": True,
            "has_life_death_case": False,
            "multi_case_flag": False,
            "overall_status": "ELIGIBLE",
            "workflow_stage": "ASSIGNED",
            "assigned_lawyer": "Adv. Krishnappa S.",
            "cases": [
                {
                    "cnr": "KAMN020089012022",
                    "court_name": "Sessions Court, Mangaluru",
                    "court_district": "Dakshina Kannada",
                    "bns_section": "BNS 309(1)",
                    "offence_description": "Robbery â€” forcible taking of property",
                    "max_sentence_years": 7.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2022-12-18",
                    "hearings": [
                        {"date": "2023-01-24", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2023-03-15", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2023-05-22", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #3"},
                        {"date": "2023-08-07", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2023-10-19", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #5"},
                        {"date": "2024-01-08", "outcome": "ADJOURNED", "reason": "ADMINISTRATIVE", "excl": False, "days_excl": 0, "ref": "Order #6"},
                        {"date": "2024-04-16", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #7"},
                        {"date": "2024-07-02", "outcome": "ADJOURNED", "reason": "PROSECUTION_WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #8"},
                    ]
                }
            ],
            "action_items": [
                {"step": 1, "title": "Verify previous conviction status", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 2, "title": "Obtain latest court order", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 3, "title": "Confirm custody calculation", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 4, "title": "Assign DLSA panel lawyer", "role": "SUPERINTENDENT", "status": "COMPLETED"},
                {"step": 5, "title": "Review AI-generated draft petition", "role": "DLSA_LAWYER", "status": "PENDING"},
            ]
        },
        # 10. INELIGIBLE - Kidnapping, long max sentence, not enough time
        {
            "prisoner_id": "KA/UDR/CP/2021/078",
            "name": "Lalitha Devi",
            "dob": "1983-05-29",
            "gender": "Female",
            "prison_name": "Udupi District Prison",
            "prison_district": "Udupi",
            "arrest_date": "2021-05-14",
            "is_first_offender": False,
            "has_life_death_case": False,
            "multi_case_flag": False,
            "overall_status": "INELIGIBLE",
            "workflow_stage": "IDENTIFIED",
            "cases": [
                {
                    "cnr": "KAUD020034562021",
                    "court_name": "Sessions Court, Udupi",
                    "court_district": "Udupi",
                    "bns_section": "BNS 137(2)",
                    "offence_description": "Kidnapping â€” abduction for ransom",
                    "max_sentence_years": 10.0,
                    "is_life_sentence": 0,
                    "is_death_sentence": 0,
                    "case_stage": "TRIAL",
                    "filing_date": "2021-05-30",
                    "hearings": [
                        {"date": "2021-07-12", "outcome": "CHARGE_FRAMED", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #1"},
                        {"date": "2021-10-05", "outcome": "ADJOURNED", "reason": "COVID_FORCE_MAJEURE", "excl": False, "days_excl": 0, "ref": "Order #2"},
                        {"date": "2022-01-18", "outcome": "ADJOURNED", "reason": "COVID_FORCE_MAJEURE", "excl": False, "days_excl": 0, "ref": "Order #3"},
                        {"date": "2022-05-24", "outcome": "ADJOURNED", "reason": "PROSECUTION_WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #4"},
                        {"date": "2022-09-08", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #5"},
                        {"date": "2023-01-16", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #6"},
                        {"date": "2023-06-07", "outcome": "ADJOURNED", "reason": "ADMINISTRATIVE", "excl": False, "days_excl": 0, "ref": "Order #7"},
                        {"date": "2023-10-19", "outcome": "HEARD", "reason": None, "excl": False, "days_excl": 0, "ref": "Order #8"},
                        {"date": "2024-03-12", "outcome": "ADJOURNED", "reason": "PROSECUTION_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #9"},
                        {"date": "2024-07-22", "outcome": "ADJOURNED", "reason": "WITNESS_ABSENT", "excl": False, "days_excl": 0, "ref": "Order #10"},
                    ]
                }
            ],
            "action_items": []
        },
    ]

    created_inmates = []
    for data in inmates_data:
        cases_data = data.pop("cases")
        actions_data = data.pop("action_items")

        inmate = Inmate(**{k: v for k, v in data.items() if k != "notes" or True})
        db.add(inmate)
        db.flush()

        for c_data in cases_data:
            hearings_data = c_data.pop("hearings")
            case = Case(inmate_id=inmate.id, **c_data)
            db.add(case)
            db.flush()

            for h_data in hearings_data:
                hearing = Hearing(
                    case_id=case.id,
                    hearing_date=h_data["date"],
                    outcome=h_data["outcome"],
                    adjournment_reason=h_data.get("reason"),
                    is_excluded_from_custody=h_data.get("excl", False),
                    days_excluded=h_data.get("days_excl", 0),
                    order_reference=h_data.get("ref"),
                )
                db.add(hearing)

        for a_data in actions_data:
            action = ActionItem(
                inmate_id=inmate.id,
                step_number=a_data["step"],
                step_title=a_data["title"],
                assigned_role=a_data["role"],
                status=a_data["status"],
            )
            db.add(action)

        created_inmates.append(inmate)
        print(f"  âœ“ {inmate.name} ({inmate.prisoner_id}) â€” {inmate.overall_status}")

    db.commit()
    print(f"\nâœ“ Created {len(created_inmates)} inmates with cases and hearings")
    return created_inmates


def seed_mvp_records(inmates):
    """Seed replaceable demo records for the case-review MVP."""
    by_name = {inmate.name: inmate for inmate in inmates}
    records = [
        ("Ramesh Kumar", "URGENT", "2026-09-18", "Missing latest hearing order"),
        ("Anita Bai", "ATTENTION", "2026-09-24", "UTRC review due"),
        ("Dinesh Patel", "URGENT", "2026-09-15", "Financial/social status report required"),
        ("Lakshmi Devi", "ATTENTION", "2026-10-02", "Verify next hearing status"),
    ]

    for name, priority, due_date, action in records:
        inmate = by_name.get(name)
        if not inmate:
            continue
        case = inmate.cases[0] if inmate.cases else None
        db.add_all([
            DocumentRecord(
                inmate_id=inmate.id, case_id=case.id if case else None,
                document_type="FIR", title="First Information Report",
                status="VERIFIED", source="Prison record import", document_date=inmate.arrest_date,
                owner_role="SUPERINTENDENT", verification_note="Demo source record verified.",
            ),
            DocumentRecord(
                inmate_id=inmate.id, case_id=case.id if case else None,
                document_type="CHARGESHEET", title="Latest chargesheet",
                status="VERIFIED" if case and case.filing_date else "MISSING",
                source="Court / CNR record" if case and case.filing_date else None,
                document_date=case.filing_date if case else None,
                owner_role="COURT DATA TEAM", verification_note="Demo record; replace with source document.",
            ),
            DocumentRecord(
                inmate_id=inmate.id, case_id=case.id if case else None,
                document_type="SOCIAL_STATUS_REPORT", title="Financial and social status report",
                status="MISSING" if priority == "URGENT" else "PENDING",
                source=None, owner_role="DLSA", verification_note="Required before authorised review.",
            ),
            BailApplication(
                inmate_id=inmate.id, case_id=case.id if case else None,
                application_number=f"BAIL/DEMO/{inmate.id:03d}", application_type="REGULAR_BAIL",
                filed_date="2026-07-12", status="REJECTED" if priority == "URGENT" else "UNDER_REVIEW",
                outcome_date="2026-08-02" if priority == "URGENT" else None,
                court_name=case.court_name if case else "District Court",
                counsel=inmate.assigned_lawyer or "DLSA assignment pending",
                order_reference="Order / Demo-12", notes="Synthetic record for MVP workflow demonstration.",
            ),
            UtrcReview(
                inmate_id=inmate.id, review_date=due_date, status="DUE", priority=priority,
                recommendation="Review custody, missing records, and legal-aid status before meeting.",
                missing_item=action, reviewed_by=None,
                notes="Synthetic UTRC agenda item. Final recommendation requires authorised committee review.",
            ),
            Deadline(
                inmate_id=inmate.id, case_id=case.id if case else None,
                deadline_type="UTRC_REVIEW", due_date=due_date, status="OPEN", priority=priority,
                owner_role="DLSA_LAWYER", action=action,
                notes="Demo deadline; connect to calendar and notification service later.",
            ),
        ])

    db.commit()
    print("[OK] Created demo documents, bail applications, UTRC reviews, and deadlines")


if __name__ == "__main__":
    print("\n[*] NYAYAI -- Seeding database...\n")
    clear_data()

    print("\n[*] Creating users...")
    users = seed_users()

    print("\n[*] Seeding inmates...")
    inmates = seed_inmates()
    print("\n[*] Seeding MVP review records...")
    seed_mvp_records(inmates)

    print("\n[OK] Database seeded successfully!")
    print("\n[*] Login credentials:")
    print("   Superintendent : superintendent@karnataka.gov.in / nyayai@123")
    print("   DLSA Lawyer    : lawyer@dlsa.karnataka.gov.in / nyayai@123")
    print("   State Admin    : admin@slsa.karnataka.gov.in / nyayai@123")
    print("   System Admin   : sysadmin@nyayai.in / admin@nyayai123")
    print("\n[>>] Start the API: uvicorn app.main:app --reload")
    db.close()

