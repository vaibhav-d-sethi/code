"""Short-range weather forecast (2 to 3 days) from Open-Meteo.

Open-Meteo is free for non-commercial use and needs no API key.
Forecasts are cached for 30 minutes so the site does not hammer the service.
This is a forecast, not part of the statistics: it never feeds the trend tests.
"""
import time
from datetime import datetime, timezone

import requests

from data_loader import CITIES

API_URL = "https://api.open-meteo.com/v1/forecast"
TIMEOUT = 10
CACHE_SECONDS = 30 * 60
MAX_DAYS = 3

# WMO weather interpretation codes, shortened to plain words.
WMO = {
    0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow",
    75: "Heavy snow", 80: "Showers", 81: "Showers", 82: "Heavy showers",
    95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm",
}

_cache: dict = {}


class WeatherError(Exception):
    """The forecast service could not be reached or sent a bad reply."""


def get_forecast(city: str, days: int = MAX_DAYS) -> dict:
    if city not in CITIES:
        raise ValueError(f"Unknown city: {city}")
    days = max(1, min(MAX_DAYS, int(days)))

    key = (city, days)
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < CACHE_SECONDS:
        return hit[1]

    place = CITIES[city]
    try:
        res = requests.get(
            API_URL,
            params={
                "latitude": place["lat"],
                "longitude": place["lon"],
                "daily": ",".join([
                    "weather_code", "temperature_2m_max", "temperature_2m_min",
                    "precipitation_sum", "precipitation_probability_max",
                ]),
                "forecast_days": days,
                "timezone": "Asia/Kolkata",
            },
            timeout=TIMEOUT,
        )
        res.raise_for_status()
        daily = res.json()["daily"]
    except (requests.RequestException, KeyError, ValueError) as exc:
        raise WeatherError("The weather forecast is not available right now. Please try again later.") from exc

    rows = []
    for i, day in enumerate(daily["time"]):
        code = daily["weather_code"][i]
        rows.append({
            "date": day,
            "weekday": datetime.strptime(day, "%Y-%m-%d").strftime("%A"),
            "label": WMO.get(code, "Mixed conditions"),
            "temp_max_c": daily["temperature_2m_max"][i],
            "temp_min_c": daily["temperature_2m_min"][i],
            "rain_mm": daily["precipitation_sum"][i],
            "rain_chance_pct": daily["precipitation_probability_max"][i],
        })

    result = {
        "city": place["name"],
        "days": rows,
        "source": "Open-Meteo forecast",
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="minutes"),
    }
    _cache[key] = (time.time(), result)
    return result
