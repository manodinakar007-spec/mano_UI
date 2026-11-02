from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PORT: int = 9102
    DATABASE_URL: str = "postgresql+asyncpg://skillfyme:skillfyme_secret@localhost:5432/skillfyme"
    LOG_LEVEL: str = "info"
    SERVICE_NAME: str = "learning-path"

    class Config:
        env_file = ".env"


settings = Settings()
