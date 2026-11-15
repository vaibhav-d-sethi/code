"""Pure statistics functions. No file or network access here.

The method we use is the one most climate and hydrology papers use for
monotonic trends in a single time series:

  1. Remove the seasonal cycle (monthly anomalies).
  2. Mann-Kendall test for a monotonic trend (Mann 1945; Kendall 1975).
  3. Sen's slope for the size of the trend (Sen 1968).
  4. Hamed and Rao (1998) variance correction, because monthly climate
     values are autocorrelated. Without it, a trend is declared significant
     too easily.

The uncorrected Mann-Kendall p-value is also reported for comparison.
A Welch t-test on the first and last decade is kept as a plain check.
"""
import numpy as np
import pandas as pd
import pymannkendall as mk
from scipy import stats as sps

GOLD_STANDARD = {
    "name": "Mann-Kendall test with Sen's slope and the Hamed-Rao autocorrelation correction",
    "short": "Mann-Kendall + Sen's slope (Hamed-Rao corrected)",
    "references": [
        "Mann, H. B. (1945). Nonparametric tests against trend. Econometrica, 13(3), 245-259.",
        "Kendall, M. G. (1975). Rank Correlation Methods. Charles Griffin, London.",
        "Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall's tau. "
        "Journal of the American Statistical Association, 63(324), 1379-1389.",
        "Hamed, K. H., & Rao, A. R. (1998). A modified Mann-Kendall trend test for autocorrelated data. "
        "Journal of Hydrology, 204(1-4), 182-196.",
    ],
    "note": (
        "The standard combination in trend studies. Mann (1945) and Kendall (1975) gave the test; "
        "Sen (1968) gave the slope; Hamed and Rao (1998) gave the autocorrelation correction."
    ),
}


def monthly_anomalies(series: pd.Series) -> pd.Series:
    """Remove the seasonal cycle: value minus that calendar month's average."""
    clim = series.groupby(series.index.month).transform("mean")
    return series - clim


def aggregate(series: pd.Series, resolution: str) -> pd.Series:
    if resolution == "yearly":
        return series.resample("YS").mean()
    if resolution == "quarterly":
        return series.resample("QS").mean()
    return series


def trend_stats(series: pd.Series, samples_per_year: int = 12) -> dict:
    """Mann-Kendall + Sen's slope with Hamed-Rao correction, plus a Welch check.

    `samples_per_year` converts Sen's slope (per sample) into a slope per decade.
    Pass 12 for monthly values, 4 for quarterly and 1 for yearly.
    """
    values = series.dropna().values
    raw = mk.original_test(values)
    try:
        corrected = mk.hamed_rao_modification_test(values)
        used = corrected
        corrected_flag = True
    except Exception:  # very short series can fail the variance estimate
        used = raw
        corrected_flag = False

    slope_per_decade = float(raw.slope) * samples_per_year * 10
    first = series.loc[: series.index.min() + pd.DateOffset(years=9)].dropna()
    last = series.loc[series.index.max() - pd.DateOffset(years=9):].dropna()
    t_p = float(sps.ttest_ind(first, last, equal_var=False).pvalue)
    return {
        "trend": used.trend,
        "p_value": float(used.p),
        "p_value_uncorrected": float(raw.p),
        "z": float(used.z),
        "sen_per_decade": round(slope_per_decade, 4),
        "significant": bool(used.p < 0.05),
        "autocorrelation_corrected": corrected_flag,
        "method": GOLD_STANDARD["short"],
        "first_decade_mean": round(float(first.mean()), 3),
        "last_decade_mean": round(float(last.mean()), 3),
        "welch_p_value": round(t_p, 4),
    }
