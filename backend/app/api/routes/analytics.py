from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.models.inmate import Inmate
from app.models.case import Case
from app.models.hearing import Hearing
from app.engine.rules_engine import calculate_days_in_custody, run_section479_assessment, CaseRecord, HearingRecord
from app.engine.review_engine import build_review_summary
from sqlalchemy.orm import joinedload
from collections import Counter

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
def dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_inmates = db.query(Inmate).count()
    eligible = db.query(Inmate).filter(Inmate.overall_status == "ELIGIBLE").count()
    multi_case = db.query(Inmate).filter(Inmate.multi_case_flag == True).count()
    action_required = db.query(Inmate).filter(
        Inmate.overall_status.in_(["ELIGIBLE", "MULTI_CASE_REVIEW"])
    ).count()
    excluded = db.query(Inmate).filter(Inmate.overall_status == "EXCLUDED").count()
    borderline = db.query(Inmate).filter(Inmate.overall_status == "BORDERLINE").count()

    # Workflow stage breakdown
    stage_counts = {}
    for stage in ["IDENTIFIED", "VERIFIED", "ASSIGNED", "DRAFTED", "REVIEWED", "FILED", "OUTCOME"]:
        count = db.query(Inmate).filter(Inmate.workflow_stage == stage).count()
        stage_counts[stage] = count

    # Action centre: rank every undertrial by transparent review signals.
    recent = db.query(Inmate).options(
        joinedload(Inmate.cases).joinedload(Case.hearings),
        joinedload(Inmate.action_items),
    ).all()

    recent_list = []
    for inmate in recent:
        days = calculate_days_in_custody(inmate.arrest_date)
        review = build_review_summary(inmate)
        recent_list.append({
            "id": inmate.id,
            "name": inmate.name,
            "prison": inmate.prison_name,
            "status": inmate.overall_status,
            "days_in_custody": days,
            "stage": inmate.workflow_stage,
            "priority": review["priority"],
            "priority_label": review["priority_label"],
            "priority_score": review["priority_score"],
            "urgent_count": review["urgent_count"],
            "attention_count": review["attention_count"],
            "missing_count": review["missing_count"],
            "recommended_action": review["recommended_action"],
            "next_hearing": review["next_hearing"],
        })
    recent_list.sort(key=lambda item: (-item["priority_score"], -item["days_in_custody"]))

    review_counts = {
        "URGENT": sum(1 for item in recent_list if item["priority"] == "URGENT"),
        "ATTENTION": sum(1 for item in recent_list if item["priority"] == "ATTENTION"),
        "NORMAL": sum(1 for item in recent_list if item["priority"] == "NORMAL"),
    }

    # Compliance measures eligible review cases, not every inmate.
    eligible_review_count = db.query(Inmate).filter(
        Inmate.overall_status.in_(["ELIGIBLE", "MULTI_CASE_REVIEW"])
    ).count()
    filed = db.query(Inmate).filter(
        Inmate.overall_status.in_(["ELIGIBLE", "MULTI_CASE_REVIEW"]),
        Inmate.workflow_stage.in_(["FILED", "OUTCOME"])
    ).count()
    compliance_rate = round((filed / eligible_review_count * 100), 1) if eligible_review_count > 0 else 0

    return {
        "total_inmates": total_inmates,
        "eligible_count": eligible,
        "eligible_review_count": eligible_review_count,
        "filed_review_count": filed,
        "action_required": action_required,
        "multi_case_count": multi_case,
        "excluded_count": excluded,
        "borderline_count": borderline,
        "compliance_rate": compliance_rate,
        "workflow_stages": stage_counts,
        "review_counts": review_counts,
        "recent_flags": recent_list,
    }


@router.get("/compliance")
def compliance_by_prison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inmates = db.query(Inmate).all()
    prison_data = {}
    for inmate in inmates:
        prison = inmate.prison_name
        if prison not in prison_data:
            prison_data[prison] = {
                "prison": prison,
                "district": inmate.prison_district,
                "total": 0,
                "eligible": 0,
                "filed": 0,
            }
        prison_data[prison]["total"] += 1
        if inmate.overall_status in ("ELIGIBLE", "MULTI_CASE_REVIEW"):
            prison_data[prison]["eligible"] += 1
        if inmate.workflow_stage in ("FILED", "OUTCOME"):
            prison_data[prison]["filed"] += 1

    for p in prison_data.values():
        p["compliance_rate"] = (
            round(p["filed"] / p["eligible"] * 100, 1) if p["eligible"] > 0 else 100.0
        )

    return {"prisons": list(prison_data.values())}


@router.get("/delay-summary")
def delay_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hearings = db.query(Hearing).filter(Hearing.outcome == "ADJOURNED").all()
    reason_counter = Counter()
    for h in hearings:
        reason = h.adjournment_reason or "OTHER"
        reason_counter[reason] += 1

    total = sum(reason_counter.values())
    breakdown = [
        {"reason": r, "count": c, "percentage": round(c / total * 100, 1)}
        for r, c in reason_counter.most_common()
    ]

    total_hearings = db.query(Hearing).count()
    total_adj = len(hearings)

    return {
        "total_hearings": total_hearings,
        "total_adjournments": total_adj,
        "overall_adjournment_rate": round(total_adj / total_hearings * 100, 1) if total_hearings else 0,
        "breakdown": breakdown
    }
