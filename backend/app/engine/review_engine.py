from datetime import date, datetime
from typing import Any, Iterable

from app.engine.rules_engine import calculate_days_in_custody


URGENT = "URGENT"
ATTENTION = "ATTENTION"
NORMAL = "NORMAL"


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def _next_hearing(cases: Iterable[Any]) -> str | None:
    today = date.today()
    future_dates = []
    for case in cases:
        for hearing in case.hearings:
            hearing_date = _parse_date(hearing.hearing_date)
            if hearing_date and hearing_date >= today:
                future_dates.append(hearing_date)
    return min(future_dates).isoformat() if future_dates else None


def build_review_summary(inmate: Any) -> dict[str, Any]:
    cases = list(inmate.cases or [])
    action_items = list(inmate.action_items or [])
    custody_days = calculate_days_in_custody(inmate.arrest_date)
    total_hearings = sum(len(case.hearings or []) for case in cases)
    adjournments = sum(
        1 for case in cases for hearing in (case.hearings or [])
        if hearing.outcome == "ADJOURNED"
    )
    pending_actions = sum(
        1 for item in action_items
        if item.status not in ("COMPLETED", "CLOSED")
    )
    required_documents = list(getattr(inmate, "documents", []) or [])
    missing_documents = [
        document for document in required_documents
        if document.is_required and document.status in ("MISSING", "PENDING")
    ]
    open_deadlines = [
        deadline for deadline in (getattr(inmate, "deadlines", []) or [])
        if deadline.status == "OPEN"
    ]
    due_utrc_reviews = [
        review for review in (getattr(inmate, "utrc_reviews", []) or [])
        if review.status in ("DUE", "OVERDUE")
    ]

    missing_information: list[dict[str, str]] = []
    if not inmate.assigned_lawyer:
        missing_information.append({
            "key": "legal_aid_lawyer",
            "label": "Legal-aid lawyer assignment",
            "owner": "DLSA",
            "severity": "URGENT" if inmate.overall_status in ("ELIGIBLE", "MULTI_CASE_REVIEW") and inmate.workflow_stage in ("IDENTIFIED", "VERIFIED") else "ATTENTION",
        })
    if not cases:
        missing_information.append({
            "key": "case_record",
            "label": "Court case record",
            "owner": "Court data team",
            "severity": "URGENT",
        })
    if any(not case.cnr for case in cases):
        missing_information.append({
            "key": "cnr",
            "label": "Court CNR / case identifier",
            "owner": "Court data team",
            "severity": "ATTENTION",
        })
    if any(not case.filing_date for case in cases):
        missing_information.append({
            "key": "filing_date",
            "label": "Case filing date",
            "owner": "Court data team",
            "severity": "ATTENTION",
        })
    if not any(hearing.order_reference for case in cases for hearing in (case.hearings or [])):
        missing_information.append({
            "key": "latest_order",
            "label": "Latest hearing order",
            "owner": "Prison / court records",
            "severity": "ATTENTION",
        })
    if inmate.multi_case_flag and len(cases) < 2:
        missing_information.append({
            "key": "linked_cases",
            "label": "Linked case verification",
            "owner": "DLSA",
            "severity": "ATTENTION",
        })
    for document in missing_documents:
        missing_information.append({
            "key": f"document_{document.id}",
            "label": document.title,
            "owner": document.owner_role or "Assigned case team",
            "severity": "URGENT" if document.document_type == "SOCIAL_STATUS_REPORT" else "ATTENTION",
        })

    signals: list[dict[str, str]] = []
    if inmate.overall_status in ("ELIGIBLE", "MULTI_CASE_REVIEW"):
        signals.append({
            "key": "review_eligibility",
            "label": "Section 479 review signal",
            "detail": "Custody and sentence information may warrant authorised legal review.",
            "severity": ATTENTION,
        })
    if custody_days >= 365:
        signals.append({
            "key": "prolonged_custody",
            "label": "Prolonged custody",
            "detail": f"{custody_days} days in custody; human review of continued detention is recommended.",
            "severity": ATTENTION,
        })
    if adjournments >= 3 and total_hearings:
        signals.append({
            "key": "procedural_delay",
            "label": "Repeated adjournments",
            "detail": f"{adjournments} of {total_hearings} hearings were adjourned; review delay causes.",
            "severity": ATTENTION,
        })
    if pending_actions:
        signals.append({
            "key": "pending_action",
            "label": "Action pending",
            "detail": f"{pending_actions} workflow item(s) require an assigned team member.",
            "severity": URGENT if inmate.workflow_stage in ("IDENTIFIED", "VERIFIED") and inmate.overall_status in ("ELIGIBLE", "MULTI_CASE_REVIEW") else ATTENTION,
        })
    if not inmate.assigned_lawyer:
        signals.append({
            "key": "legal_aid_gap",
            "label": "Legal aid not assigned",
            "detail": "Assign or verify a legal-aid lawyer before the next review step.",
            "severity": URGENT if inmate.overall_status in ("ELIGIBLE", "MULTI_CASE_REVIEW") and inmate.workflow_stage in ("IDENTIFIED", "VERIFIED") else ATTENTION,
        })
    if due_utrc_reviews:
        signals.append({
            "key": "utrc_due",
            "label": "UTRC review due",
            "detail": "Prepare the case record and missing-information list for authorised committee review.",
            "severity": URGENT,
        })
    if open_deadlines:
        signals.append({
            "key": "deadline_open",
            "label": "Open action deadline",
            "detail": f"{len(open_deadlines)} deadline(s) are open; assigned teams should confirm ownership and completion.",
            "severity": URGENT if any(item.priority == "URGENT" for item in open_deadlines) else ATTENTION,
        })

    urgent_count = sum(1 for signal in signals + missing_information if signal["severity"] == URGENT)
    attention_count = sum(1 for signal in signals + missing_information if signal["severity"] == ATTENTION)
    if urgent_count:
        priority = URGENT
        priority_label = "Immediate attention"
    elif inmate.workflow_stage in ("DRAFTED", "REVIEWED", "FILED", "OUTCOME") and not due_utrc_reviews and not open_deadlines:
        priority = NORMAL
        priority_label = "No immediate action"
    elif attention_count:
        priority = ATTENTION
        priority_label = "Review required"
    else:
        priority = NORMAL
        priority_label = "No immediate action"

    if urgent_count:
        recommended_action = "Review urgent signals and assign the next legal-aid or UTRC action."
    elif attention_count:
        recommended_action = "Resolve missing information and review procedural delay before the next hearing."
    else:
        recommended_action = "Continue monitoring the next hearing and keep case records current."

    timeline = [{
        "date": inmate.arrest_date,
        "type": "ARREST",
        "title": "Arrest and custody began",
        "detail": "Custody timeline starts from the recorded arrest date.",
    }]
    for case in cases:
        if case.filing_date:
            timeline.append({
                "date": case.filing_date,
                "type": "CASE_FILED",
                "title": f"{case.bns_section} case filed",
                "detail": f"{case.court_name} · CNR {case.cnr or 'not recorded'}",
            })
        for hearing in case.hearings or []:
            timeline.append({
                "date": hearing.hearing_date,
                "type": hearing.outcome,
                "title": hearing.outcome.replace("_", " ").title(),
                "detail": hearing.notes or hearing.order_reference or "Hearing event recorded.",
            })
    timeline.sort(key=lambda event: event["date"] or "")

    return {
        "priority": priority,
        "priority_label": priority_label,
        "priority_score": urgent_count * 3 + attention_count,
        "urgent_count": urgent_count,
        "attention_count": attention_count,
        "signal_count": len(signals),
        "missing_count": len(missing_information),
        "signals": signals,
        "missing_information": missing_information,
        "recommended_action": recommended_action,
        "next_hearing": _next_hearing(cases),
        "timeline": timeline,
        "integrations": [
            {"key": "prison", "label": "Prison custody record", "status": "Connected", "detail": inmate.prison_name},
            {"key": "court", "label": "Court / CNR record", "status": "Connected" if any(case.cnr for case in cases) else "Needs mapping", "detail": "Case graph source"},
            {"key": "dlsa", "label": "DLSA legal-aid record", "status": "Assigned" if inmate.assigned_lawyer else "Action needed", "detail": inmate.assigned_lawyer or "No lawyer linked"},
            {"key": "documents", "label": "Document register", "status": "Partial" if missing_information else "Ready for review", "detail": f"{len(missing_information)} information gap(s)"},
            {"key": "bail", "label": "Bail application history", "status": "Source mapping pending", "detail": "Connect authorised court records"},
            {"key": "utrc", "label": "UTRC review register", "status": "Review signal ready", "detail": "Meeting decision requires authorised verification"},
        ],
        "bail_history_count": len(getattr(inmate, "bail_applications", []) or []),
        "utrc_due_count": len(due_utrc_reviews),
        "open_deadline_count": len(open_deadlines),
    }
