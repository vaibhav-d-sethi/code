"""Loads settings from the .env file. Never put real keys in this file."""
import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    earthdata_username: str
    earthdata_password: str
    groq_api_key: str
    groq_model: str
    groq_max_retries: int
    groq_timeout: float
    token_budget_q1_in: int
    token_budget_q1_out: int
    token_budget_q2_in: int
    token_budget_q2_out: int
    cors_origins: list
    computed_dir: str


def load_settings() -> Settings:
    origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500",
    )
    return Settings(
        earthdata_username=os.getenv("EARTHDATA_USERNAME", ""),
        earthdata_password=os.getenv("EARTHDATA_PASSWORD", ""),
        groq_api_key=os.getenv("GROQ_API_KEY", ""),
        groq_model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
        groq_max_retries=int(os.getenv("GROQ_MAX_RETRIES", "1")),
        groq_timeout=float(os.getenv("GROQ_TIMEOUT", "25")),
        # Reasoning models spend output tokens before the JSON.
        # 700 leaves room for the JSON reply to finish.
        token_budget_q1_in=int(os.getenv("TOKEN_BUDGET_Q1_IN", "1200")),
        token_budget_q1_out=int(os.getenv("TOKEN_BUDGET_Q1_OUT", "700")),
        token_budget_q2_in=int(os.getenv("TOKEN_BUDGET_Q2_IN", "2500")),
        token_budget_q2_out=int(os.getenv("TOKEN_BUDGET_Q2_OUT", "700")),
        cors_origins=[o.strip() for o in origins.split(",") if o.strip()],
        computed_dir=os.getenv("COMPUTED_DIR", "data/computed"),
    )


settings = load_settings()
