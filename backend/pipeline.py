"""Runs the two-query pipeline. The only module that calls the others in order."""
import json
import logging

from budget import fit_resolution
from config import settings
from data_loader import CITIES, VARIABLES, YEAR_MAX, YEAR_MIN, load_city
from groq_client import GroqError, chat, parse_json
from prompts import ANSWER_SYSTEM, ROUTER_SYSTEM
from stats import aggregate, monthly_anomalies, trend_stats
from summarizer import summarise

log = logging.getLogger("circuit-sages")

UNSUPPORTED = "I can only answer questions about the five cities and two variables in this dataset."


def _route(question: str) -> dict:
    """Query 1. Turns the question into a plan. Retries once if the reply is not clean JSON."""
    messages = [
        {"role": "system", "content": ROUTER_SYSTEM},
        {"role": "user", "content": question},
    ]
    for attempt in range(2):
        raw = chat(messages, settings.token_budget_q1_out, json_mode=True)
        try:
            return parse_json(raw)
        except ValueError:
            if attempt == 0:
                messages.append({"role": "assistant", "content": raw[:300]})
                messages.append({"role": "user", "content": "That was not valid JSON. Reply with the JSON object only."})
    raise GroqError("I could not understand that question. Try rephrasing it, or pick a preset.")


def _validate(plan: dict) -> dict:
    """Clamp and check the plan so a bad model reply cannot break the maths."""
    city = str(plan.get("city", "lucknow")).lower().strip()
    variable = str(plan.get("variable", "T2M_C")).strip()
    if city not in CITIES or variable not in VARIABLES:
        raise GroqError(UNSUPPORTED)
    start = max(YEAR_MIN, min(YEAR_MAX, int(plan.get("start_year", YEAR_MIN))))
    end = max(YEAR_MIN, min(YEAR_MAX, int(plan.get("end_year", YEAR_MAX))))
    if start >= end:
        start, end = YEAR_MIN, YEAR_MAX
    return {
        "engineered_question": str(plan.get("engineered_question", "")),
        "city": city, "variable": variable, "start_year": start, "end_year": end,
        "stats_needed": plan.get("stats_needed", ["trend", "sen_slope", "p_value"]),
        "resolution": plan.get("resolution", "monthly"),
    }


def run_question(text: str) -> dict:
    words = " ".join(text.split()[:50])
    plan = _route(words)
    if "error" in plan:
        return {"answer": plan.get("reason") or UNSUPPORTED, "plan": plan, "unsupported": True}

    plan = _validate(plan)
    city, variable = plan["city"], plan["variable"]
    start, end = plan["start_year"], plan["end_year"]

    df = load_city(city, start, end)
    series = df[variable].loc[str(start) : str(end)]
    if series.dropna().empty:
        raise GroqError(f"There is no data for {CITIES[city]['name']} in {start} to {end}.")
    stats = trend_stats(monthly_anomalies(series).dropna())
    rows = {
        r: [{"date": str(d.date()), "value": round(float(v), 3)}
            for d, v in aggregate(series, r).dropna().items()]
        for r in ("monthly", "quarterly", "yearly")
    }
    res, used = fit_resolution(rows, settings.token_budget_q2_in // 2)
    summary = summarise(CITIES[city]["name"], VARIABLES[variable]["label"], start, end, stats)
    answer = chat(
        [{"role": "system", "content": ANSWER_SYSTEM},
         {"role": "user", "content": f"Question: {plan['engineered_question']}\n\n{summary}\n\n"
                                     f"Series ({res}): {json.dumps(used)}"}],
        settings.token_budget_q2_out,
    )
    return {"answer": answer, "plan": plan, "stats": stats, "series_used": res}
