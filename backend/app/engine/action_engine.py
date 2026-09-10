"""
NYAYAI Action Intelligence Engine

Converts an assessment result into a structured, ordered action checklist.
Maps each action to the responsible role and tracks workflow stage.

Workflow stages:
  IDENTIFIED → VERIFIED → ASSIGNED → DRAFTED → REVIEWED → FILED → OUTCOME
"""

from dataclasses import dataclass
from typing import List
from datetime import datetime


WORKFLOW_STAGES = [
    "IDENTIFIED",
    "VERIFIED",
    "ASSIGNED",
    "DRAFTED",
    "REVIEWED",
    "FILED",
    "OUTCOME"
]


@dataclass
class ActionStep:
    step_number: int
    title: str
    description: str
    assigned_role: str  # SUPERINTENDENT / DLSA_LAWYER / STATE_ADMIN
    is_required: bool
    is_ai_assisted: bool
    stage: str


def generate_action_plan(
    assessment_status: str,
    is_first_offender: bool,
    multi_case: bool,
    missing_info: List[str],
    current_stage: str = "IDENTIFIED"
) -> List[ActionStep]:
    """
    Generates the ordered action plan based on assessment status.
    Returns a list of ActionStep objects.
    """

    steps: List[ActionStep] = []

    if assessment_status == "EXCLUDED":
        steps.append(ActionStep(
            step_number=1,
            title="Record exclusion",
            description="Mark case as excluded from Section 479 — involves life/death sentence. "
                        "No further action required unless offence charges change.",
            assigned_role="SUPERINTENDENT",
            is_required=True,
            is_ai_assisted=False,
            stage="IDENTIFIED"
        ))
        return steps

    if assessment_status == "INELIGIBLE":
        steps.append(ActionStep(
            step_number=1,
            title="Schedule future review",
            description="Case does not yet meet Section 479 threshold. "
                        "Schedule automated review at 90% of threshold date.",
            assigned_role="SUPERINTENDENT",
            is_required=True,
            is_ai_assisted=True,
            stage="IDENTIFIED"
        ))
        return steps

    # For ELIGIBLE / BORDERLINE / MULTI_CASE_REVIEW
    step_num = 1

    # Step 1: Verify previous conviction status
    steps.append(ActionStep(
        step_number=step_num,
        title="Verify previous conviction status",
        description="Confirm whether the undertrial has any prior convictions by checking "
                    "prison records and obtaining a character/antecedent report from police.",
        assigned_role="SUPERINTENDENT",
        is_required=True,
        is_ai_assisted=False,
        stage="VERIFIED"
    ))
    step_num += 1

    # Step 2: Obtain latest court order
    steps.append(ActionStep(
        step_number=step_num,
        title="Obtain and upload latest court order",
        description="Retrieve the most recent court order for all linked cases. "
                    "Upload to NYAYAI for AI-assisted review and timeline update.",
        assigned_role="SUPERINTENDENT",
        is_required=True,
        is_ai_assisted=True,
        stage="VERIFIED"
    ))
    step_num += 1

    # Step 3: Confirm custody calculation
    steps.append(ActionStep(
        step_number=step_num,
        title="Confirm custody calculation",
        description="Review and confirm the effective custody days calculation, "
                    "particularly the days excluded due to defence-caused adjournments.",
        assigned_role="SUPERINTENDENT",
        is_required=True,
        is_ai_assisted=True,
        stage="VERIFIED"
    ))
    step_num += 1

    # Step 4: Multi-case check (if applicable)
    if multi_case:
        steps.append(ActionStep(
            step_number=step_num,
            title="Verify all linked cases",
            description="Multiple cases detected. Confirm that all linked cases have been "
                        "identified and that no case involves a life/death sentence or "
                        "disqualifying factor.",
            assigned_role="SUPERINTENDENT",
            is_required=True,
            is_ai_assisted=True,
            stage="VERIFIED"
        ))
        step_num += 1

    # Missing info steps
    for mi in missing_info:
        steps.append(ActionStep(
            step_number=step_num,
            title=f"Resolve information gap",
            description=mi,
            assigned_role="SUPERINTENDENT",
            is_required=True,
            is_ai_assisted=False,
            stage="VERIFIED"
        ))
        step_num += 1

    # Step: Assign DLSA panel lawyer
    steps.append(ActionStep(
        step_number=step_num,
        title="Assign DLSA panel lawyer",
        description="Forward case to District Legal Services Authority for assignment "
                    "of a panel lawyer to review and file the Section 479 application.",
        assigned_role="SUPERINTENDENT",
        is_required=True,
        is_ai_assisted=False,
        stage="ASSIGNED"
    ))
    step_num += 1

    # Step: AI draft petition
    steps.append(ActionStep(
        step_number=step_num,
        title="Review AI-generated Section 479 draft petition",
        description="NYAYAI has prepared a draft Section 479 bail application with "
                    "supporting evidence. Panel lawyer must review, edit and sign "
                    "before filing.",
        assigned_role="DLSA_LAWYER",
        is_required=True,
        is_ai_assisted=True,
        stage="DRAFTED"
    ))
    step_num += 1

    # Step: Human review
    steps.append(ActionStep(
        step_number=step_num,
        title="Human review and approval",
        description="Panel lawyer confirms all facts, reviews evidence trail, "
                    "and approves the petition for filing. No automated filing — "
                    "mandatory human sign-off.",
        assigned_role="DLSA_LAWYER",
        is_required=True,
        is_ai_assisted=False,
        stage="REVIEWED"
    ))
    step_num += 1

    # Step: File with court
    steps.append(ActionStep(
        step_number=step_num,
        title="File petition with court",
        description="File the approved Section 479 petition with the relevant court "
                    "and record the filing date and case/CNR number.",
        assigned_role="DLSA_LAWYER",
        is_required=True,
        is_ai_assisted=False,
        stage="FILED"
    ))
    step_num += 1

    # Step: Record outcome
    steps.append(ActionStep(
        step_number=step_num,
        title="Record court outcome",
        description="Record the court's decision on the Section 479 petition. "
                    "If bail is granted, coordinate release with prison administration.",
        assigned_role="DLSA_LAWYER",
        is_required=True,
        is_ai_assisted=False,
        stage="OUTCOME"
    ))

    return steps
