"""
NYAYAI Delay Intelligence Engine

Analyses court hearing records to answer the key question:
"WHY has this person remained in custody for X years?"

Classifies each adjournment into:
  - PROSECUTION_ABSENT: prosecution party/witness did not appear
  - DEFENCE_ABSENT: defence counsel absent (excluded from effective custody)
  - WITNESS_ABSENT: witness did not appear
  - ADMINISTRATIVE: court administrative reason (recess, holiday, etc.)
  - COVID_FORCE_MAJEURE: pandemic / force majeure
  - OTHER: unclassified

Detects systemic delay patterns and assigns severity.
"""

from dataclasses import dataclass
from typing import List, Dict
from collections import Counter


@dataclass
class AdjournmentClassification:
    reason_code: str
    reason_label: str
    count: int
    percentage: float
    is_defence_caused: bool
    days_lost: int


@dataclass
class DelayIntelligenceReport:
    total_hearings: int
    total_adjournments: int
    adjournment_rate: float
    classifications: List[AdjournmentClassification]
    defence_caused_days: int
    systemic_delay_detected: bool
    delay_severity: str  # CRITICAL / HIGH / MEDIUM / LOW / NONE
    delay_narrative: str
    top_delay_reason: str
    recommendations: List[str]


DEFENCE_CAUSES = {"DEFENCE_ABSENT", "DEFENCE_COUNSEL_ABSENT"}
PROSECUTION_CAUSES = {"PROSECUTION_ABSENT", "PROSECUTION_WITNESS_ABSENT", "WITNESS_ABSENT"}
ADMIN_CAUSES = {"ADMINISTRATIVE", "COURT_HOLIDAY", "COURT_VACATION"}
FORCE_MAJEURE = {"COVID_FORCE_MAJEURE", "NATURAL_DISASTER", "FORCE_MAJEURE"}

REASON_LABELS = {
    "PROSECUTION_ABSENT": "Prosecution party absent",
    "PROSECUTION_WITNESS_ABSENT": "Prosecution witness absent",
    "WITNESS_ABSENT": "Witness unavailable",
    "DEFENCE_ABSENT": "Defence counsel absent",
    "DEFENCE_COUNSEL_ABSENT": "Defence counsel absent",
    "ADMINISTRATIVE": "Administrative / court order",
    "COURT_HOLIDAY": "Court holiday / recess",
    "COURT_VACATION": "Court vacation",
    "COVID_FORCE_MAJEURE": "COVID-19 / Force majeure",
    "OTHER": "Other / unclassified",
}


def analyse_delays(hearings: list) -> DelayIntelligenceReport:
    """
    Takes a list of Hearing ORM objects (or dicts) and returns a full delay report.
    """
    total = len(hearings)
    adjourned = [h for h in hearings if h.outcome == "ADJOURNED"]
    adj_count = len(adjourned)

    if total == 0:
        return _empty_report()

    adj_rate = round((adj_count / total) * 100, 1)

    # Tally by reason
    reason_counts: Counter = Counter()
    reason_days: Dict[str, int] = {}
    for h in adjourned:
        code = (h.adjournment_reason or "OTHER").upper()
        reason_counts[code] += 1
        reason_days[code] = reason_days.get(code, 0) + (h.days_excluded or 0)

    classifications = []
    defence_caused_days = 0

    for code, count in reason_counts.most_common():
        is_defence = code in DEFENCE_CAUSES
        days = reason_days.get(code, 0)
        if is_defence:
            defence_caused_days += days
        classifications.append(AdjournmentClassification(
            reason_code=code,
            reason_label=REASON_LABELS.get(code, code.replace("_", " ").title()),
            count=count,
            percentage=round((count / adj_count) * 100, 1) if adj_count else 0,
            is_defence_caused=is_defence,
            days_lost=days
        ))

    # Determine severity
    systemic = adj_rate >= 40
    if adj_rate >= 70:
        severity = "CRITICAL"
    elif adj_rate >= 50:
        severity = "HIGH"
    elif adj_rate >= 30:
        severity = "MEDIUM"
    elif adj_rate >= 15:
        severity = "LOW"
    else:
        severity = "NONE"

    top_reason = reason_counts.most_common(1)[0][0] if reason_counts else "N/A"
    top_label = REASON_LABELS.get(top_reason, top_reason)

    narrative = _build_narrative(adj_count, total, adj_rate, severity, top_label, classifications)
    recommendations = _build_recommendations(severity, classifications, adj_rate)

    return DelayIntelligenceReport(
        total_hearings=total,
        total_adjournments=adj_count,
        adjournment_rate=adj_rate,
        classifications=classifications,
        defence_caused_days=defence_caused_days,
        systemic_delay_detected=systemic,
        delay_severity=severity,
        delay_narrative=narrative,
        top_delay_reason=top_label,
        recommendations=recommendations
    )


def _build_narrative(adj_count, total, adj_rate, severity, top_label, classifications) -> str:
    lines = []
    if severity in ("CRITICAL", "HIGH"):
        lines.append(
            f"⚠ Systemic delay detected. {adj_count} of {total} hearings ({adj_rate}%) resulted in adjournment. "
            f"The most frequent cause is '{top_label}'."
        )
    elif severity == "MEDIUM":
        lines.append(
            f"Moderate delay pattern observed. {adj_count} of {total} hearings adjourned ({adj_rate}%). "
            f"Primary cause: '{top_label}'."
        )
    else:
        lines.append(f"No significant delay pattern detected. Adjournment rate: {adj_rate}%.")

    defence_adj = [c for c in classifications if c.is_defence_caused]
    if defence_adj:
        total_def_days = sum(c.days_lost for c in defence_adj)
        lines.append(
            f"{sum(c.count for c in defence_adj)} defence-caused adjournments detected — "
            f"{total_def_days} days excluded from effective custody calculation."
        )

    return " ".join(lines)


def _build_recommendations(severity, classifications, adj_rate) -> List[str]:
    recs = []
    prose_causes = [c.reason_code for c in classifications if not c.is_defence_caused and c.percentage > 25]
    defence_causes = [c for c in classifications if c.is_defence_caused]

    if severity in ("CRITICAL", "HIGH"):
        recs.append("Flag case for priority DLSA review.")
        recs.append("Include delay analysis as supporting evidence in Section 479 application.")

    if "PROSECUTION_ABSENT" in prose_causes or "PROSECUTION_WITNESS_ABSENT" in prose_causes:
        recs.append("Document prosecution-side absences as evidence of systemic delay for court.")

    if defence_causes:
        recs.append("Verify defence-caused days are correctly excluded from custody calculation.")

    if adj_rate >= 50:
        recs.append("Recommend escalation to District Judge for case monitoring.")

    if not recs:
        recs.append("No immediate action required. Continue standard monitoring.")

    return recs


def _empty_report() -> DelayIntelligenceReport:
    return DelayIntelligenceReport(
        total_hearings=0, total_adjournments=0, adjournment_rate=0.0,
        classifications=[], defence_caused_days=0,
        systemic_delay_detected=False, delay_severity="NONE",
        delay_narrative="No hearing records available.",
        top_delay_reason="N/A", recommendations=["No hearing data to analyse."]
    )
