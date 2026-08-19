import os

from dotenv import load_dotenv

load_dotenv()


def _database_uri(value):
    if value and value.startswith("postgres://"):
        return value.replace("postgres://", "postgresql://", 1)
    return value


class BaseConfig:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    SQLALCHEMY_DATABASE_URI = _database_uri(os.getenv("DATABASE_URL", "sqlite:///preppilot.db"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]


class DevelopmentConfig(BaseConfig):
    DEBUG = True


class ProductionConfig(BaseConfig):
    DEBUG = False


def validate_production_config():
    required = ("SECRET_KEY", "JWT_SECRET_KEY", "DATABASE_URL", "CORS_ORIGINS")
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise RuntimeError(f"Missing production environment variables: {', '.join(missing)}")
    if os.getenv("SECRET_KEY") == os.getenv("JWT_SECRET_KEY"):
        raise RuntimeError("SECRET_KEY and JWT_SECRET_KEY must be distinct in production")
    database_url = _database_uri(os.getenv("DATABASE_URL"))
    if not database_url or database_url.startswith("sqlite"):
        raise RuntimeError("Production DATABASE_URL must point to PostgreSQL")


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
