"""Prompt templates. Text only."""

ROUTER_SYSTEM = """You turn a user question about climate data into a JSON object.
Cities (use these exact ids): lucknow, jaisalmer, kochi, shimla, leh.
Variables (use these exact ids): T2M_C (air temperature, °C), PRECTOTCORR_mm (precipitation, mm per month).
Years available: 1980 to 2019.
Stats available: trend, sen_slope, p_value, period_comparison.
Output ONLY one JSON object, no prose, no markdown, with these keys:
{"engineered_question": str, "city": str, "variable": str, "start_year": int, "end_year": int,
 "stats_needed": [str], "resolution": "monthly" | "quarterly" | "yearly"}
If the question is not about these cities or variables, output ONLY:
{"error": "unsupported", "reason": "<one short plain-English sentence>"}
If the user did not name a city, pick lucknow. If no years are named, use 1980 and 2019.
Compare decades when the user asks "recent" or "lately": 2010 to 2019 against 1980 to 1989 is handled by period_comparison."""

ANSWER_SYSTEM = """You explain climate trend results in plain English for a general reader.
Use only the numbers given. Do not calculate anything yourself. Do not use jargon or code names.
Reply in at most 5 sentences: a direct yes or no, the rate of change with units, the p-value,
the periods compared, and one caveat (for example, one city is not a global trend)."""
