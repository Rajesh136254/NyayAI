from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models.inmate import Inmate
from app.api.routes import auth, inmates, analytics, audit, mvp
from app.models import DocumentRecord, BailApplication, UtrcReview, Deadline

# Create all tables
Base.metadata.create_all(bind=engine)


def seed_empty_database() -> None:
    """Seed demo data once when explicitly enabled for a new environment."""
    if not settings.SEED_ON_STARTUP:
        return

    db = SessionLocal()
    try:
        if db.query(Inmate).count() > 0:
            return

        from seed import seed_users, seed_inmates, seed_mvp_records

        seed_users()
        inmates = seed_inmates()
        seed_mvp_records(inmates)
    finally:
        db.close()


seed_empty_database()

app = FastAPI(
    title=settings.APP_NAME,
    description="AI Intelligence Layer for Justice & Undertrial Workflows — BNSS Section 479 Compliance",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Standard FastAPI CORSMiddleware with regex support for any localhost/domain port
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://nyay-ai-psi.vercel.app",
        "https://nyay-ai-git-master-nyay-ai3.vercel.app",
        "https://nyay-pluw3zje5-nyay-ai3.vercel.app",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(inmates.router)
app.include_router(analytics.router)
app.include_router(audit.router)
app.include_router(mvp.router)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "Justice AI Platform — BNSS Section 479 Compliance Engine",
        "docs": "/docs",
        "status": "operational"
    }


@app.get("/health")
def health():
    return {"status": "healthy", "app": settings.APP_NAME}
