"""Computes a monthly series for a coordinate box straight from NASA Earthdata (MERRA-2).

The box is two corners: (lat1, lon1) and (lat2, lon2). Every MERRA-2 grid cell inside the box is
averaged for each month. Runs in a background thread so the page can poll for progress.

Needs EARTHDATA_USERNAME and EARTHDATA_PASSWORD in .env, and the EULA for both collections
approved on the Earthdata website. Writes data/computed/<area_id>.csv when done.
"""
import calendar
import logging
import threading
import time
import uuid
from pathlib import Path

import pandas as pd

from config import settings
from data_loader import area_path, area_id

log = logging.getLogger("circuit-sages")

SLV, FLX = "M2TMNXSLV", "M2TMNXFLX"
JOBS: dict = {}
_lock = threading.Lock()


def _set(job_id: str, **fields) -> None:
    with _lock:
        JOBS[job_id].update(fields, updated=time.time())


def start_job(box: dict, start: int, end: int) -> str:
    job_id = uuid.uuid4().hex[:12]
    aid = area_id(box, start, end)
    with _lock:
        JOBS[job_id] = {"id": job_id, "area": aid, "box": box, "start": start, "end": end,
                        "status": "queued", "progress": 0, "message": "Waiting to start",
                        "file": None, "error": None, "updated": time.time()}
    threading.Thread(target=_run, args=(job_id, box, start, end), daemon=True).start()
    return job_id


def get_job(job_id: str) -> dict | None:
    with _lock:
        job = JOBS.get(job_id)
        return dict(job) if job else None


def _run(job_id: str, box: dict, start: int, end: int) -> None:
    try:
        _set(job_id, status="running", message="Logging in to NASA Earthdata")
        if not settings.earthdata_username or not settings.earthdata_password:
            raise RuntimeError("Add EARTHDATA_USERNAME and EARTHDATA_PASSWORD to .env first.")
        import earthaccess
        import xarray as xr

        auth = earthaccess.login(strategy="environment")
        if not auth.authenticated:
            raise RuntimeError("NASA Earthdata login failed. Check the username and password in .env.")

        lat_min, lat_max = sorted([box["lat1"], box["lat2"]])
        lon_min, lon_max = sorted([box["lon1"], box["lon2"]])
        temporal = (f"{start}-01-01", f"{end}-12-31")
        bbox = (lon_min, lat_min, lon_max, lat_max)

        values: dict = {}
        for short, var in ((SLV, "T2M"), (FLX, "PRECTOTCORR")):
            _set(job_id, message=f"Searching {short} granules")
            granules = earthaccess.search_data(short_name=short, temporal=temporal, bounding_box=bbox)
            if not granules:
                raise RuntimeError(f"NASA returned no {short} files for this box and range.")
            files = earthaccess.open(granules)
            for i, f in enumerate(files, 1):
                ds = xr.open_dataset(f, engine="h5netcdf")
                try:
                    cells = ds[var].sel(lat=slice(lat_min, lat_max), lon=slice(lon_min, lon_max))
                    if cells.size == 0:
                        raise RuntimeError("The box is too small to contain a NASA grid cell. Make it larger.")
                    mean = float(cells.mean(dim=["lat", "lon"]).values.squeeze())
                    when = pd.Timestamp(ds["time"].values[0])
                    values.setdefault(when.strftime("%Y-%m"), {})[var] = mean
                finally:
                    ds.close()
                base = 0 if var == "T2M" else 50
                _set(job_id, progress=base + round(i / len(files) * 45),
                     message=f"Read {i} of {len(files)} {short} files")

        _set(job_id, message="Converting units and saving", progress=95)
        rows = []
        for key in sorted(values):
            v = values[key]
            if "T2M" not in v or "PRECTOTCORR" not in v:
                continue
            year, month = int(key[:4]), int(key[5:7])
            days = calendar.monthrange(year, month)[1]
            rows.append({"date": key, "T2M_C": round(v["T2M"] - 273.15, 2),
                         "PRECTOTCORR_mm": round(v["PRECTOTCORR"] * 86400 * days, 2)})
        if not rows:
            raise RuntimeError("No months had both temperature and rainfall. Try a different range.")

        out: Path = area_path(box, start, end)
        out.parent.mkdir(parents=True, exist_ok=True)
        pd.DataFrame(rows).to_csv(out, index=False)
        _set(job_id, status="done", progress=100, file=out.name,
             message=f"Done: {len(rows)} months saved for this area")
        log.info("Computed area %s: %d rows", out.name, len(rows))
    except Exception as exc:  # shown to the user as a friendly message
        log.exception("Compute job %s failed", job_id)
        _set(job_id, status="error", error=str(exc)[:400], message="The job stopped.")
