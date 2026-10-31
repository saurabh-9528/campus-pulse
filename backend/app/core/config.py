from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Campus Pulse API"
    APP_ENV: str = "development"
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "campus_pulse"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gemini-1.5-flash"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
