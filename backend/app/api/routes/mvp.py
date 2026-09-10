from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.models.bail_application import BailApplication
from app.models.deadline import Deadline
from app.models.document import DocumentRecord
from app.models.inmate import Inmate
from app.models.user import User
from app.models.utrc_review import UtrcReview

router = APIRouter(prefix="/inmates", tags=["MVP Case Review"])
UPLOAD_ROOT = Path(__file__).resolve().parents[3] / "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


def _get_inmate(db: Session, inmate_id: int) -> Inmate:
    inmate = db.query(Inmate).filter(Inmate.id == inmate_id).first()
    if not inmate:
        raise HTTPException(status_code=404, detail="Inmate not found")
    return inmate


@router.get("/{inmate_id}/mvp-records")
def get_mvp_records(
    inmate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_inmate(db, inmate_id)
    documents = db.query(DocumentRecord).filter(DocumentRecord.inmate_id == inmate_id).order_by(DocumentRecord.document_type).all()
    bail_applications = db.query(BailApplication).filter(BailApplication.inmate_id == inmate_id).order_by(BailApplication.filed_date.desc()).all()
    utrc_reviews = db.query(UtrcReview).filter(UtrcReview.inmate_id == inmate_id).order_by(UtrcReview.review_date.desc()).all()
    deadlines = db.query(Deadline).filter(Deadline.inmate_id == inmate_id).order_by(Deadline.due_date).all()

    return {
        "inmate_id": inmate_id,
        "documents": [{
            "id": item.id, "case_id": item.case_id, "document_type": item.document_type,
            "title": item.title, "status": item.status, "source": item.source,
            "document_date": item.document_date, "owner_role": item.owner_role,
            "verification_note": item.verification_note, "is_required": item.is_required,
        } for item in documents],
        "bail_applications": [{
            "id": item.id, "case_id": item.case_id, "application_number": item.application_number,
            "application_type": item.application_type, "filed_date": item.filed_date,
            "status": item.status, "outcome_date": item.outcome_date, "court_name": item.court_name,
            "counsel": item.counsel, "order_reference": item.order_reference, "notes": item.notes,
        } for item in bail_applications],
        "utrc_reviews": [{
            "id": item.id, "review_date": item.review_date, "status": item.status,
            "priority": item.priority, "recommendation": item.recommendation,
            "missing_item": item.missing_item, "reviewed_by": item.reviewed_by,
            "decision_date": item.decision_date, "notes": item.notes,
        } for item in utrc_reviews],
        "deadlines": [{
            "id": item.id, "case_id": item.case_id, "deadline_type": item.deadline_type,
            "due_date": item.due_date, "status": item.status, "priority": item.priority,
            "owner_role": item.owner_role, "action": item.action, "notes": item.notes,
        } for item in deadlines],
    }


@router.post("/{inmate_id}/documents")
async def upload_document(
    inmate_id: int,
    file: UploadFile = File(...),
    document_type: str = Form("OTHER"),
    case_id: int | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inmate = _get_inmate(db, inmate_id)
    original_name = Path(file.filename or "document").name
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Upload a PDF, image, DOC, or DOCX file")

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Document must be smaller than 10 MB")

    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    stored_name = f"{inmate_id}-{uuid4().hex}{extension}"
    stored_path = UPLOAD_ROOT / stored_name
    stored_path.write_bytes(content)

    record = DocumentRecord(
        inmate_id=inmate.id,
        case_id=case_id,
        document_type=document_type.upper(),
        title=original_name,
        status="PENDING",
        source=f"MVP upload: uploads/{stored_name}",
        owner_role=current_user.role,
        verification_note="Uploaded document requires authorised human verification before use in a legal review.",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "id": record.id,
        "document_type": record.document_type,
        "title": record.title,
        "status": record.status,
        "source": record.source,
        "owner_role": record.owner_role,
        "verification_note": record.verification_note,
    }
