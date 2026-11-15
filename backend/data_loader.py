"""Loads data. Cities come from the local CSVs. Coordinate boxes come from computed files."""
from pathlib import Path

import pandas as pd

from config import settings

ROOT = Path(__file__).resolve().parent.parent
CITY_DIR = ROOT / "data" / "cities"
COMPUTED_DIR = (ROOT / settings.computed_dir).resolve()

CITIES = {
    "lucknow": {"name": "Lucknow", "lat": 26.85, "lon": 80.95, "climate": "Humid subtropical, monsoon"},
    "jaisalmer": {"name": "Jaisalmer", "lat": 26.92, "lon": 70.91, "climate": "Hot desert"},
    "kochi": {"name": "Kochi", "lat": 9.93, "lon": 76.27, "climate": "Tropical, wet"},
    "shimla": {"name": "Shimla", "lat": 31.10, "lon": 77.17, "climate": "Himalayan highland"},
    "leh": {"name": "Leh", "lat": 34.17, "lon": 77.58, "climate": "Cold high-altitude desert"},
}
CITY_IDS = list(CITIES)

VARIABLES = {
    "T2M_C": {"label": "Air temperature", "unit": "°C"},
    "PRECTOTCORR_mm": {"label": "Precipitation", "unit": "mm per month"},
}

YEAR_MIN, YEAR_MAX = 1980, 2019


def area_id(box: dict, start: int, end: int) -> str:
    lat_min, lat_max = sorted([box["lat1"], box["lat2"]])
    lon_min, lon_max = sorted([box["lon1"], box["lon2"]])
    return f"area_{lat_min:.2f}_{lon_min:.2f}_{lat_max:.2f}_{lon_max:.2f}_{start}_{end}"


def area_path(box: dict, start: int, end: int) -> Path:
    return COMPUTED_DIR / f"{area_id(box, start, end)}.csv"


def load_city(city: str, start: int | None = None, end: int | None = None) -> pd.DataFrame:
    if city not in CITIES:
        raise ValueError(f"Unknown city: {city}")
    path = CITY_DIR / f"{city}.csv"
    if not path.exists():
        raise FileNotFoundError(
            f"The local data for {CITIES[city]['name']} is not on this computer yet. "
            "Run scripts/build_city_csv.py for this city."
        )
    return pd.read_csv(path, parse_dates=["date"]).set_index("date")


def load_area(box: dict, start: int, end: int) -> pd.DataFrame:
    path = area_path(box, start, end)
    if not path.exists():
        raise FileNotFoundError("That area has not been computed yet. Compute it on the Compute page first.")
    return pd.read_csv(path, parse_dates=["date"]).set_index("date")
