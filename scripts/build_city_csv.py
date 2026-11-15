"""Build one city CSV from MERRA-2 monthly files.

Usage (from the circuit-sages folder):
    python scripts/build_city_csv.py lucknow

Reads:  <MERRA_DIR>/M2TMNXSLV/*.nc4  (T2M, Kelvin)
        <MERRA_DIR>/M2TMNXFLX/*.nc4  (PRECTOTCORR, kg m-2 s-1)
Writes: data/cities/<city>.csv  with columns date, T2M_C, PRECTOTCORR_mm
"""
import calendar
import glob
import os
import sys

import pandas as pd
import xarray as xr

MERRA_DIR = os.environ.get("MERRA_DIR", r"C:\Users\91516\merra_data")

CITIES = {
    "lucknow":   (26.85, 80.95),
    "jaisalmer": (26.92, 70.91),
    "kochi":     (9.93, 76.27),
    "shimla":    (31.10, 77.17),
    "leh":       (34.17, 77.58),
}


def month_files(folder):
    files = sorted(glob.glob(os.path.join(folder, "*.nc4")))
    if not files:
        raise FileNotFoundError(f"No .nc4 files in {folder}")
    return files


def point_value(path, var, lat, lon):
    ds = xr.open_dataset(path)
    try:
        val = ds[var].sel(lat=lat, lon=lon, method="nearest")
        return float(val.values.squeeze()), ds["time"].values[0]
    finally:
        ds.close()


def build(city):
    if city not in CITIES:
        raise SystemExit(f"Unknown city '{city}'. Choose from: {', '.join(CITIES)}")
    lat, lon = CITIES[city]

    slv = month_files(os.path.join(MERRA_DIR, "M2TMNXSLV"))
    flx = month_files(os.path.join(MERRA_DIR, "M2TMNXFLX"))
    flx_by_key = {os.path.basename(f).split(".")[-2]: f for f in flx}

    rows = []
    for f in slv:
        key = os.path.basename(f).split(".")[-2]  # YYYYMM
        if key not in flx_by_key:
            print(f"Skipping {key}: no matching FLX file")
            continue
        t2m_k, t = point_value(f, "T2M", lat, lon)
        prec_s, _ = point_value(flx_by_key[key], "PRECTOTCORR", lat, lon)
        year, month = int(key[:4]), int(key[4:6])
        days = calendar.monthrange(year, month)[1]
        rows.append({
            "date": f"{year:04d}-{month:02d}",
            "T2M_C": round(t2m_k - 273.15, 2),
            "PRECTOTCORR_mm": round(prec_s * 86400 * days, 2),
        })

    df = pd.DataFrame(rows)
    out_dir = os.path.join("data", "cities")
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"{city}.csv")
    df.to_csv(out, index=False)

    print(f"Wrote {out}: {len(df)} rows")
    print(f"T2M_C range: {df.T2M_C.min()} to {df.T2M_C.max()}")
    print(f"PRECTOTCORR_mm range: {df.PRECTOTCORR_mm.min()} to {df.PRECTOTCORR_mm.max()}")
    if len(df) < 470:
        print("WARNING: expected about 480 rows. Check the downloads.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/build_city_csv.py <city>")
    build(sys.argv[1].lower())
