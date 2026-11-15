"""Rough token counting and resolution fallback for the Groq calls."""
import math

SAFETY = 1.2


def count_tokens(text: str) -> int:
    """About 4 characters per token, plus a 20 percent safety margin."""
    return math.ceil(len(text) / 4 * SAFETY)


def fit_resolution(rows: list, budget: int, resolutions=("monthly", "quarterly", "yearly")):
    """Return the finest resolution whose serialised rows fit the budget."""
    import json
    for res in resolutions:
        if count_tokens(json.dumps(rows[res])) <= budget:
            return res, rows[res]
    return resolutions[-1], rows[resolutions[-1]]
