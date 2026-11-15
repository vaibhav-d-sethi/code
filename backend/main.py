"""FastAPI app. Routes only, no business logic."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from config import settings
from data_loader import CITIES, VARIABLES, YEAR_MAX, YEAR_MIN, load_city
from earth_compute import get_job, start_job
from groq_client import GroqError
from pipeline import run_question
from presets import load_presets
from stats import GOLD_STANDARD, aggregate, monthly_anomalies, trend_stats
from weather import WeatherError, get_forecast

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="Circuit Sages API", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class Ask(BaseModel):
    question: str = Field(min_length=3, max_length=600)


class Box(BaseModel):
    lat1: float = Field(ge=-90, le=90)
    lon1: float = Field(ge=-180, le=180)
    lat2: float = Field(ge=-90, le=90)
    lon2: float = Field(ge=-180, le=180)


class ComputeRequest(BaseModel):
    box: Box
    start: int = Field(ge=YEAR_MIN, le=YEAR_MAX)
    end: int = Field(ge=YEAR_MIN, le=YEAR_MAX)


def _err(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"error": code, "message": message})


@app.exception_handler(GroqError)
async def groq_error(_, exc: GroqError):
    return _err(503, "ai_unavailable", str(exc))


@app.exception_handler(WeatherError)
async def weather_error(_, exc: WeatherError):
    return _err(503, "weather_unavailable", str(exc))


@app.exception_handler(FileNotFoundError)
async def missing_data(_, exc: FileNotFoundError):
    return _err(404, "no_data", str(exc))


@app.exception_handler(ValueError)
async def bad_value(_, exc: ValueError):
    return _err(400, "bad_request", str(exc))


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/variables")
def variables():
    return [{"id": k, **v} for k, v in VARIABLES.items()]


@app.get("/cities")
def cities():
    return [{"id": k, **v} for k, v in CITIES.items()]


@app.get("/series")
def series(city: str, variable: str, start: int = YEAR_MIN, end: int = YEAR_MAX,
           resolution: str = "monthly"):
    s = load_city(city, start, end)[variable].loc[str(start) : str(end)]
    s = aggregate(s, resolution).dropna()
    return {"dates": [str(d.date()) for d in s.index], "values": s.round(3).tolist(),
            "unit": VARIABLES[variable]["unit"], "label": VARIABLES[variable]["label"]}


@app.get("/trend")
def trend(city: str, variable: str, start: int = YEAR_MIN, end: int = YEAR_MAX):
    s = load_city(city, start, end)[variable].loc[str(start) : str(end)]
    return trend_stats(monthly_anomalies(s).dropna())


@app.get("/method")
def method():
    return GOLD_STANDARD


@app.get("/forecast/{city}")
def forecast(city: str, days: int = 3):
    return get_forecast(city, days)


@app.get("/presets")
def presets():
    return load_presets()


@app.post("/ask")
def ask(body: Ask):
    if len(body.question.split()) > 50:
        return _err(400, "too_long", "Please keep your question under 50 words.")
    return run_question(body.question)


@app.post("/compute")
def compute(body: ComputeRequest):
    b = body.box
    lat_span = abs(b.lat1 - b.lat2)
    lon_span = abs(b.lon1 - b.lon2)
    if not (2 <= lat_span <= 4) or not (2 <= lon_span <= 4):
        return _err(400, "bad_box", "Each side of the box must be between 2 and 4 degrees.")
    if body.start >= body.end:
        return _err(400, "bad_range", "The end year must be after the start year.")
    if body.end - body.start > 40:
        return _err(400, "too_long_range", "Please pick a range of 40 years or fewer.")
    return {"job_id": start_job(b.model_dump(), body.start, body.end)}


@app.get("/compute/{job_id}")
def compute_status(job_id: str):
    job = get_job(job_id)
    if not job:
        return _err(404, "unknown_job", "That job was not found. Start it again.")
    return job
