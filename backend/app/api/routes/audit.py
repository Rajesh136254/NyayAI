from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.models.action_item import AuditLog
from typing import Optional

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("")
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    user_email: Optional[str] = None,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only STATE_ADMIN and SYSTEM_ADMIN can view audit logs
    if current_user.role not in ("STATE_ADMIN", "SYSTEM_ADMIN"):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())

    if user_email:
        query = query.filter(AuditLog.user_email.ilike(f"%{user_email}%"))
    if action:
        query = query.filter(AuditLog.action == action.upper())

    total = query.count()
    logs = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "items": [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "user_email": log.user_email,
                "user_role": log.user_role,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "description": log.description,
                "ip_address": log.ip_address,
            }
            for log in logs
        ]
    }
