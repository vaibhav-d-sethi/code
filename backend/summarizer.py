"""Turns a stats dict into short plain sentences for the model."""


def summarise(city: str, label: str, start: int, end: int, s: dict) -> str:
    direction = {"increasing": "rose", "decreasing": "fell"}.get(s["trend"], "showed no clear change")
    sig = "statistically significant (p < 0.05)" if s["significant"] else "not statistically significant"
    return (
        f"City: {city}. Variable: {label}. Period: {start} to {end}.\n"
        f"Trend: the value {direction}. Rate (Sen's slope): {s['sen_per_decade']} per decade.\n"
        f"Method: {s.get('method', 'Mann-Kendall')}. p-value: {s['p_value']:.4f}, {sig}.\n"
        f"Average departure from the normal for each month: first decade {s['first_decade_mean']}, last decade {s['last_decade_mean']} (units as the variable). "
        f"Welch p-value: {s['welch_p_value']}."
    )
