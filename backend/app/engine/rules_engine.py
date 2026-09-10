"""
NYAYAI Rules Engine â€” Section 479 BNSS 2023 Deterministic Calculator

Section 479 BNSS 2023 rules:
- First-time offender: entitled to bail if served >= 1/3 of maximum sentence
- Repeat offender: entitled to bail if served >= 1/2 of maximum sentence
- Excluded: Cases involving offences punishable by LIFE imprisonment or DEATH
- Effective custody = total days arrested - days excluded (defence-caused delays)
- If undertrial has MULTIPLE cases, ALL cases must clear the threshold

The LLM extracts facts. This engine calculates. Never the other way around.
"""

from datetime import date, datetime
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class HearingRecord:
    hearing_date: str
    outcome: str
    adjournment_reason: Optional[str]
    is_excluded_from_custody: bool
    days_excluded: int
    order_reference: Optional[str]


@dataclass
class CaseRecord:
    case_id: int
    cnr: Optional[str]
    court_name: str
    bns_section: str
    offence_description: str
    max_sentence_years: float
    is_life_sentence: bool
    is_death_sentence: bool
    hearings: List[HearingRecord]


@dataclass
class Section479Assessment:
    eligible: bool
    status: str  # ELIGIBLE / INELIGIBLE / EXCLUDED / BORDERLINE / MULTI_CASE_REVIEW
    arrest_date: str
    total_days_in_custody: int
    days_excluded: int
    effective_custody_days: int
    threshold_days: int
    threshold_fraction: str  # "1/3" or "1/2"
    is_first_offender: bool
    has_life_death_case: bool
    multi_case_flag: bool
    cases_summary: list
    evidence_trail: List[str]
    missing_info: List[str]
    ai_explanation: str
    confidence: str  # HIGH / MEDIUM / LOW


def calculate_days_in_custody(arrest_date_str: str) -> int:
    """Calculate total days from arrest to today."""
    try:
        arrest_date = datetime.strptime(arrest_date_str, "%Y-%m-%d").date()
        today = date.today()
        return (today - arrest_date).days
    except ValueError:
        return 0


def calculate_excluded_days(hearings: List[HearingRecord]) -> tuple[int, List[str]]:
    """
    Sum days excluded from custody (defence-caused delays).
    Returns (total_excluded_days, list_of_evidence_references)
    """
    total_excluded = 0
    evidence = []
    for h in hearings:
        if h.is_excluded_from_custody and h.days_excluded > 0:
            total_excluded += h.days_excluded
            ref = h.order_reference or h.hearing_date
            reason = h.adjournment_reason or "Defence delay"
            evidence.append(f"{ref} â€” {reason} ({h.days_excluded} days excluded)")
    return total_excluded, evidence


def run_section479_assessment(
    arrest_date: str,
    is_first_offender: bool,
    cases: List[CaseRecord],
    has_previous_convictions: bool = False
) -> Section479Assessment:
    """
    Main entry point for Section 479 BNSS assessment.
    Deterministic logic only â€” no AI/LLM in this function.
    """
    evidence_trail = []
    missing_info = []

    # Step 1: Calculate total custody
    total_days = calculate_days_in_custody(arrest_date)
    evidence_trail.append(f"Arrest date: {arrest_date} -> Total days in custody: {total_days}")

    # Step 2: Check for life/death sentence exclusion
    has_life_death = any(c.is_life_sentence or c.is_death_sentence for c in cases)
    if has_life_death:
        return Section479Assessment(
            eligible=False,
            status="EXCLUDED",
            arrest_date=arrest_date,
            total_days_in_custody=total_days,
            days_excluded=0,
            effective_custody_days=total_days,
            threshold_days=0,
            threshold_fraction="N/A",
            is_first_offender=is_first_offender,
            has_life_death_case=True,
            multi_case_flag=len(cases) > 1,
            cases_summary=[{"section": c.bns_section, "max_years": c.max_sentence_years} for c in cases],
            evidence_trail=["Case involves offence punishable by LIFE/DEATH â€” Section 479 NOT applicable."],
            missing_info=[],
            ai_explanation=(
                "This undertrial is not eligible for Section 479 relief because one or more cases "
                "involve offences punishable by life imprisonment or death penalty. Section 479 BNSS "
                "explicitly excludes such cases from the bail provision."
            ),
            confidence="HIGH"
        )

    # Step 3: Calculate excluded days across all hearings
    all_hearings = [h for c in cases for h in c.hearings]
    total_excluded, exclusion_evidence = calculate_excluded_days(all_hearings)
    evidence_trail.extend(exclusion_evidence)
    effective_days = total_days - total_excluded
    evidence_trail.append(f"Effective custody: {total_days} - {total_excluded} = {effective_days} days")

    # Step 4: Determine threshold fraction
    # First-time offender = 1/3; repeat offender = 1/2
    fraction = "1/3" if is_first_offender else "1/2"
    denominator = 3 if is_first_offender else 2
    evidence_trail.append(f"Offender status: {'First-time' if is_first_offender else 'Repeat'} â†’ Threshold fraction: {fraction}")

    if not is_first_offender and not has_previous_convictions:
        missing_info.append("Previous conviction status requires manual verification from prison/court records.")

    # Step 5: Find the MINIMUM threshold case (most restrictive)
    # If ANY case has a sentence so high that threshold is not met â†’ ineligible
    min_threshold = None
    cases_summary = []
    all_eligible = True

    for c in cases:
        max_days = int(c.max_sentence_years * 365)
        threshold = max_days // denominator
        case_eligible = effective_days >= threshold
        if not case_eligible:
            all_eligible = False
        if min_threshold is None or threshold > min_threshold:
            min_threshold = threshold

        cases_summary.append({
            "case_id": c.case_id,
            "cnr": c.cnr,
            "section": c.bns_section,
            "court": c.court_name,
            "max_years": c.max_sentence_years,
            "threshold_days": threshold,
            "eligible": case_eligible,
            "total_hearings": len(c.hearings),
            "adjournments": sum(1 for h in c.hearings if h.outcome == "ADJOURNED"),
        })

        evidence_trail.append(
            f"{c.bns_section} ({c.court_name}): Max {c.max_sentence_years}y = {max_days}d â†’ "
            f"Threshold ({fraction}): {threshold}d â†’ {'âœ“ MET' if case_eligible else 'âœ— NOT MET'}"
        )

    threshold_days = min_threshold or 0
    multi_case = len(cases) > 1

    # Step 6: Determine final status
    if not all_eligible:
        if effective_days >= threshold_days * 0.85:
            status = "BORDERLINE"
            eligible = False
        else:
            status = "INELIGIBLE"
            eligible = False
    elif multi_case:
        status = "MULTI_CASE_REVIEW"
        eligible = True
        missing_info.append("Multiple cases detected â€” requires human verification that all cases meet the threshold.")
    else:
        status = "ELIGIBLE"
        eligible = True

    # Step 7: AI explanation (templated â€” in production this would be LLM-generated)
    explanation = _generate_explanation(
        status, effective_days, threshold_days, fraction, is_first_offender,
        multi_case, cases_summary, missing_info
    )

    confidence = "HIGH" if not missing_info else ("MEDIUM" if len(missing_info) == 1 else "LOW")

    return Section479Assessment(
        eligible=eligible,
        status=status,
        arrest_date=arrest_date,
        total_days_in_custody=total_days,
        days_excluded=total_excluded,
        effective_custody_days=effective_days,
        threshold_days=threshold_days,
        threshold_fraction=fraction,
        is_first_offender=is_first_offender,
        has_life_death_case=False,
        multi_case_flag=multi_case,
        cases_summary=cases_summary,
        evidence_trail=evidence_trail,
        missing_info=missing_info,
        ai_explanation=explanation,
        confidence=confidence
    )


def _generate_explanation(status, effective_days, threshold_days, fraction,
                           first_offender, multi_case, cases_summary, missing_info) -> str:
    status_texts = {
        "ELIGIBLE": (
            f"This undertrial appears eligible for Section 479 BNSS review. "
            f"As a {'first-time' if first_offender else 'repeat'} offender, the applicable threshold is {fraction} "
            f"of the maximum sentence. The effective custody period of {effective_days} days meets or exceeds "
            f"the threshold of {threshold_days} days. "
            + (f"Note: {len(cases_summary)} cases are linked â€” all thresholds have been verified. " if multi_case else "")
            + "Human review and court filing are required before any action."
        ),
        "INELIGIBLE": (
            f"This undertrial does not yet meet the Section 479 BNSS eligibility threshold. "
            f"Effective custody is {effective_days} days against a required minimum of {threshold_days} days "
            f"({fraction} of maximum sentence). No immediate action is required unless the situation changes."
        ),
        "BORDERLINE": (
            f"This case is borderline â€” effective custody ({effective_days} days) is close to but has not "
            f"yet reached the {fraction} threshold ({threshold_days} days). "
            "This case should be flagged for review in the near term. "
            "Monitor and reassign to DLSA when the threshold is met."
        ),
        "MULTI_CASE_REVIEW": (
            f"This undertrial has multiple linked cases. All cases appear to individually meet the {fraction} "
            f"threshold (effective custody: {effective_days} days). However, cross-case status requires "
            "manual human verification by a DLSA panel lawyer to confirm that no case involves "
            "a life/death offence or prior conviction that changes the calculation."
        ),
        "EXCLUDED": (
            "This case is excluded from Section 479 relief because it involves an offence punishable "
            "by life imprisonment or death penalty. Section 479 BNSS explicitly excludes such cases."
        ),
    }
    base = status_texts.get(status, "Assessment status could not be determined.")
    if missing_info:
        base += f" âš  {len(missing_info)} information gap(s) detected that require verification."
    return base

