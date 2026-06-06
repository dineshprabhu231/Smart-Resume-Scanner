"""
Application Configuration
Supports SQLite (development) and MySQL (production) via DATABASE_URL env var.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
    DEBUG = False

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-jwt-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400))
    )

    # Database — defaults to SQLite, swap DATABASE_URL for MySQL/Postgres in prod
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "sqlite:///smart_resume.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File uploads (Vercel Serverless requires writing to /tmp)
    is_prod = os.getenv("FLASK_ENV") == "production"
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/tmp" if is_prod else os.path.join(os.path.dirname(__file__), "..", "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))  # 16 MB
    ALLOWED_EXTENSIONS = {"pdf", "docx", "doc"}


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
