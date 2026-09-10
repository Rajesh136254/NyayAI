from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./nyayai.db"
    SECRET_KEY: str = "nyayai-super-secret-jwt-key-change-in-production-2024"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    SEED_ON_STARTUP: bool = False
    ALGORITHM: str = "HS256"
    APP_NAME: str = "NYAYAI"
    APP_VERSION: str = "1.0.0"

    class Config:
        env_file = ".env"


settings = Settings()
