from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, decode_access_token
from app.core.config import settings
from app.models.user import User
from app.models.action_item import AuditLog
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


@router.options("/login")
def options_login():
    return Response(status_code=200)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    # Audit log
    log = AuditLog(
        user_email=user.email,
        user_role=user.role,
        action="LOGIN",
        description=f"User {user.name} logged in",
        ip_address=req.client.host if req.client else "unknown"
    )
    db.add(log)
    db.commit()

    token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "prison_id": user.prison_id,
            "district": user.district,
        }
    )


@router.options("/me")
def options_me():
    return Response(status_code=200)


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "prison_id": current_user.prison_id,
        "district": current_user.district,
        "last_login": current_user.last_login,
    }


@router.options("/logout")
def options_logout():
    return Response(status_code=200)


@router.post("/logout")
def logout(req: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = AuditLog(
        user_email=current_user.email,
        user_role=current_user.role,
        action="LOGOUT",
        description=f"User {current_user.name} logged out",
        ip_address=req.client.host if req.client else "unknown"
    )
    db.add(log)
    db.commit()
    return {"message": "Logged out successfully"}
