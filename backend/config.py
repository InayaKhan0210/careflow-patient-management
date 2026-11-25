
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    database_url = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'patients.db'}"
    )

    if database_url.startswith("postgresql://"):
        database_url = database_url.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1
        )

    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
