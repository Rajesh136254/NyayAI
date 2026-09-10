from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.models.inmate import Inmate
from app.models.case import Case
from app.models.hearing import Hearing
from app.models.action_item import AuditLog
from app.engine.rules_engine import (
    run_section479_assessment, CaseRecord, HearingRecord
)
from app.engine.delay_engine import analyse_delays
from app.engine.action_engine import generate_action_plan
from app.engine.review_engine import build_review_summary
from dataclasses import asdict

router = APIRouter(prefix="/inmates", tags=["Inmates"])


def _log_action(db, user, action, resource_id, description, req):
    log = AuditLog(
        user_email=user.email,
        user_role=user.role,
        action=action,
        resource_type="INMATE",
        resource_id=str(resource_id),
        description=description,
        ip_address=req.client.host if req.client else "unknown"
    )
    db.add(log)
    db.commit()


@router.get("")
def list_inmates(
    req: Request,
    search: Optional[str] = None,
    status: Optional[str] = None,
    stage: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Inmate).options(joinedload(Inmate.cases))

    if search:
        query = query.filter(
            Inmate.name.ilike(f"%{search}%") |
            Inmate.prisoner_id.ilike(f"%{search}%") |
            Inmate.prison_name.ilike(f"%{search}%")
        )
    if status:
        query = query.filter(Inmate.overall_status == status.upper())
    if stage:
        query = query.filter(Inmate.workflow_stage == stage.upper())

    total = query.count()
    inmates = query.offset(skip).limit(limit).all()

    result = []
    for inmate in inmates:
        from app.engine.rules_engine import calculate_days_in_custody
        total_days = calculate_days_in_custody(inmate.arrest_date)
        result.append({
            "id": inmate.id,
            "prisoner_id": inmate.prisoner_id,
            "name": inmate.name,
            "prison_name": inmate.prison_name,
            "prison_district": inmate.prison_district,
            "arrest_date": inmate.arrest_date,
            "days_in_custody": total_days,
            "is_first_offender": inmate.is_first_offender,
            "overall_status": inmate.overall_status,
            "workflow_stage": inmate.workflow_stage,
            "multi_case_flag": inmate.multi_case_flag,
            "has_life_death_case": inmate.has_life_death_case,
            "assigned_lawyer": inmate.assigned_lawyer,
            "case_count": len(inmate.cases),
        })

    return {"total": total, "items": result, "skip": skip, "limit": limit}


@router.get("/{inmate_id}")
def get_inmate_detail(
    inmate_id: int,
    req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inmate = db.query(Inmate).options(
        joinedload(Inmate.cases).joinedload(Case.hearings),
        joinedload(Inmate.action_items)
    ).filter(Inmate.id == inmate_id).first()

    if not inmate:
        raise HTTPException(status_code=404, detail="Inmate not found")

    _log_action(db, current_user, "VIEW", inmate_id,
                f"Viewed inmate profile: {inmate.name}", req)

    # Build case graph
    cases_data = []
    for case in inmate.cases:
        hearings_data = sorted([{
            "id": h.id,
            "hearing_date": h.hearing_date,
            "outcome": h.outcome,
            "adjournment_reason": h.adjournment_reason,
            "is_excluded_from_custody": h.is_excluded_from_custody,
            "days_excluded": h.days_excluded,
            "order_reference": h.order_reference,
            "notes": h.notes,
        } for h in case.hearings], key=lambda x: x["hearing_date"])

        cases_data.append({
            "id": case.id,
            "cnr": case.cnr,
            "court_name": case.court_name,
            "court_district": case.court_district,
            "bns_section": case.bns_section,
            "offence_description": case.offence_description,
            "max_sentence_years": case.max_sentence_years,
            "is_life_sentence": bool(case.is_life_sentence),
            "is_death_sentence": bool(case.is_death_sentence),
            "case_stage": case.case_stage,
            "filing_date": case.filing_date,
            "hearings": hearings_data,
            "total_hearings": len(hearings_data),
        })

    from app.engine.rules_engine import calculate_days_in_custody
    return {
        "id": inmate.id,
        "prisoner_id": inmate.prisoner_id,
        "name": inmate.name,
        "dob": inmate.dob,
        "gender": inmate.gender,
        "prison_name": inmate.prison_name,
        "prison_district": inmate.prison_district,
        "arrest_date": inmate.arrest_date,
        "days_in_custody": calculate_days_in_custody(inmate.arrest_date),
        "is_first_offender": inmate.is_first_offender,
        "has_life_death_case": inmate.has_life_death_case,
        "multi_case_flag": inmate.multi_case_flag,
        "overall_status": inmate.overall_status,
        "workflow_stage": inmate.workflow_stage,
        "assigned_lawyer": inmate.assigned_lawyer,
        "notes": inmate.notes,
        "review_summary": build_review_summary(inmate),
        "documents": [{
            "id": item.id, "document_type": item.document_type, "title": item.title,
            "status": item.status, "source": item.source, "document_date": item.document_date,
            "owner_role": item.owner_role, "verification_note": item.verification_note,
        } for item in inmate.documents],
        "bail_applications": [{
            "id": item.id, "application_type": item.application_type, "filed_date": item.filed_date,
            "status": item.status, "outcome_date": item.outcome_date, "court_name": item.court_name,
            "counsel": item.counsel, "order_reference": item.order_reference, "notes": item.notes,
        } for item in inmate.bail_applications],
        "utrc_reviews": [{
            "id": item.id, "review_date": item.review_date, "status": item.status,
            "priority": item.priority, "recommendation": item.recommendation,
            "missing_item": item.missing_item, "notes": item.notes,
        } for item in inmate.utrc_reviews],
        "deadlines": [{
            "id": item.id, "deadline_type": item.deadline_type, "due_date": item.due_date,
            "status": item.status, "priority": item.priority, "owner_role": item.owner_role,
            "action": item.action, "notes": item.notes,
        } for item in inmate.deadlines],
        "cases": cases_data,
        "action_items": [
            {
                "id": a.id,
                "step_number": a.step_number,
                "step_title": a.step_title,
                "step_description": a.step_description,
                "status": a.status,
                "assigned_role": a.assigned_role,
                "stage": a.stage if hasattr(a, 'stage') else None,
            }
            for a in sorted(inmate.action_items, key=lambda x: x.step_number)
        ]
    }


@router.get("/{inmate_id}/assessment")
def get_assessment(
    inmate_id: int,
    req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inmate = db.query(Inmate).options(
        joinedload(Inmate.cases).joinedload(Case.hearings)
    ).filter(Inmate.id == inmate_id).first()

    if not inmate:
        raise HTTPException(status_code=404, detail="Inmate not found")

    _log_action(db, current_user, "VIEW", inmate_id,
                f"Viewed Section 479 assessment: {inmate.name}", req)

    # Build engine input
    case_records = []
    for c in inmate.cases:
        hearing_records = [
            HearingRecord(
                hearing_date=h.hearing_date,
                outcome=h.outcome,
                adjournment_reason=h.adjournment_reason,
                is_excluded_from_custody=h.is_excluded_from_custody,
                days_excluded=h.days_excluded or 0,
                order_reference=h.order_reference
            )
            for h in c.hearings
        ]
        case_records.append(CaseRecord(
            case_id=c.id,
            cnr=c.cnr,
            court_name=c.court_name,
            bns_section=c.bns_section,
            offence_description=c.offence_description,
            max_sentence_years=c.max_sentence_years,
            is_life_sentence=bool(c.is_life_sentence),
            is_death_sentence=bool(c.is_death_sentence),
            hearings=hearing_records
        ))

    assessment = run_section479_assessment(
        arrest_date=inmate.arrest_date,
        is_first_offender=inmate.is_first_offender,
        cases=case_records
    )

    result = asdict(assessment)
    # Update inmate status based on assessment
    inmate.overall_status = assessment.status
    db.commit()

    return result


@router.get("/{inmate_id}/delays")
def get_delay_intelligence(
    inmate_id: int,
    case_id: Optional[int] = None,
    req: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inmate = db.query(Inmate).options(
        joinedload(Inmate.cases).joinedload(Case.hearings)
    ).filter(Inmate.id == inmate_id).first()

    if not inmate:
        raise HTTPException(status_code=404, detail="Inmate not found")

    results = []
    for case in inmate.cases:
        if case_id and case.id != case_id:
            continue
        hearings = case.hearings
        report = analyse_delays(hearings)
        results.append({
            "case_id": case.id,
            "cnr": case.cnr,
            "court_name": case.court_name,
            "bns_section": case.bns_section,
            "report": asdict(report)
        })

    return {"inmate_id": inmate_id, "inmate_name": inmate.name, "cases": results}


@router.get("/{inmate_id}/actions")
def get_action_plan(
    inmate_id: int,
    req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inmate = db.query(Inmate).options(
        joinedload(Inmate.cases).joinedload(Case.hearings)
    ).filter(Inmate.id == inmate_id).first()

    if not inmate:
        raise HTTPException(status_code=404, detail="Inmate not found")

    # Run assessment to get status
    case_records = []
    for c in inmate.cases:
        case_records.append(CaseRecord(
            case_id=c.id, cnr=c.cnr, court_name=c.court_name,
            bns_section=c.bns_section, offence_description=c.offence_description,
            max_sentence_years=c.max_sentence_years,
            is_life_sentence=bool(c.is_life_sentence),
            is_death_sentence=bool(c.is_death_sentence),
            hearings=[
                HearingRecord(
                    hearing_date=h.hearing_date, outcome=h.outcome,
                    adjournment_reason=h.adjournment_reason,
                    is_excluded_from_custody=h.is_excluded_from_custody,
                    days_excluded=h.days_excluded or 0,
                    order_reference=h.order_reference
                ) for h in c.hearings
            ]
        ))

    assessment = run_section479_assessment(
        arrest_date=inmate.arrest_date,
        is_first_offender=inmate.is_first_offender,
        cases=case_records
    )

    action_steps = generate_action_plan(
        assessment_status=assessment.status,
        is_first_offender=inmate.is_first_offender,
        multi_case=inmate.multi_case_flag,
        missing_info=assessment.missing_info,
        current_stage=inmate.workflow_stage
    )

    return {
        "inmate_id": inmate_id,
        "inmate_name": inmate.name,
        "workflow_stage": inmate.workflow_stage,
        "assessment_status": assessment.status,
        "steps": [asdict(s) for s in action_steps]
    }


@router.patch("/{inmate_id}/status")
def update_status(
    inmate_id: int,
    body: dict,
    req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inmate = db.query(Inmate).filter(Inmate.id == inmate_id).first()
    if not inmate:
        raise HTTPException(status_code=404, detail="Inmate not found")

    if "workflow_stage" in body:
        inmate.workflow_stage = body["workflow_stage"]
    if "assigned_lawyer" in body:
        inmate.assigned_lawyer = body["assigned_lawyer"]
    if "notes" in body:
        inmate.notes = body["notes"]

    db.commit()
    _log_action(db, current_user, "MODIFY", inmate_id,
                f"Updated status for {inmate.name}: {body}", req)

    return {"message": "Updated successfully", "workflow_stage": inmate.workflow_stage}
