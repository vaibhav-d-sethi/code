"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ErrorCard } from "@/components/States";
import Icon from "@/components/Icon";

const STORAGE_KEY = "cs-pins";

function spanOk(a, b) {
  const s = Math.abs(a - b);
  return s >= 2 && s <= 4;
}

export default function ComputePage() {
  const [box, setBox] = useState({ lat1: "26.0", lon1: "79.0", lat2: "29.0", lon2: "82.0" });
  const [start, setStart] = useState(2010);
  const [end, setEnd] = useState(2019);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinCount, setPinCount] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    try {
      const pins = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setPinCount(Array.isArray(pins) ? pins.length : 0);
    } catch { setPinCount(0); }
    return () => clearTimeout(timer.current);
  }, []);

  // The globe keeps one pin. It fills the first corner; type the opposite corner yourself.
  function useFirstPin() {
    const pins = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (pins.length < 1) { setError("Drop a pin on the home page globe first."); return; }
    setError("");
    setBox({ ...box, lat1: String(pins[0].lat), lon1: String(pins[0].lon) });
  }

  function poll(id) {
    api.computeStatus(id)
      .then((j) => {
        setJob(j);
        if (j.status === "queued" || j.status === "running") {
          timer.current = setTimeout(() => poll(id), 2000);
        } else {
          setBusy(false);
          if (j.status === "error") setError(j.error || "The job stopped.");
        }
      })
      .catch((e) => { setBusy(false); setError(e.message); });
  }

  async function start_() {
    setError("");
    const b = { lat1: Number(box.lat1), lon1: Number(box.lon1), lat2: Number(box.lat2), lon2: Number(box.lon2) };
    if ([b.lat1, b.lon1, b.lat2, b.lon2].some((v) => Number.isNaN(v))) { setError("Enter all four corner values as numbers."); return; }
    if (!spanOk(b.lat1, b.lat2) || !spanOk(b.lon1, b.lon2)) {
      setError("Each side of the box must be between 2 and 4 degrees.");
      return;
    }
    if (Number(start) >= Number(end)) { setError("The end year must be later than the start year."); return; }
    setBusy(true); setJob(null);
    try {
      const { job_id } = await api.startCompute({ box: b, start: Number(start), end: Number(end) });
      poll(job_id);
    } catch (e) { setBusy(false); setError(e.message); }
  }

  const sideLat = Math.abs(Number(box.lat1) - Number(box.lat2)).toFixed(1);
  const sideLon = Math.abs(Number(box.lon1) - Number(box.lon2)).toFixed(1);
  const done = job?.status === "done";

  return (
    <div className="container section">
      <p className="eyebrow">Compute</p>
      <h1 style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)" }}>Compute an area from NASA Earthdata</h1>
      <p className="lede" style={{ marginBottom: 28 }}>
        Enter two opposite corners of a box, between 2° and 4° on each side. The app averages all NASA grid cells inside it, month by month.
      </p>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-labelledby="box-h">
          <h2 id="box-h" style={{ fontSize: "1.2rem" }}>1. Two corners</h2>
          <div className="stack" style={{ marginTop: 12 }}>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="label" style={{ fontWeight: 700, marginBottom: 6 }}>Corner A</legend>
              <div className="range-row">
                <div className="field"><label htmlFor="lat1">Latitude</label>
                  <input id="lat1" type="text" inputMode="decimal" value={box.lat1} onChange={(e) => setBox({ ...box, lat1: e.target.value })} /></div>
                <div className="field"><label htmlFor="lon1">Longitude</label>
                  <input id="lon1" type="text" inputMode="decimal" value={box.lon1} onChange={(e) => setBox({ ...box, lon1: e.target.value })} /></div>
              </div>
            </fieldset>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="label" style={{ fontWeight: 700, marginBottom: 6 }}>Corner B</legend>
              <div className="range-row">
                <div className="field"><label htmlFor="lat2">Latitude</label>
                  <input id="lat2" type="text" inputMode="decimal" value={box.lat2} onChange={(e) => setBox({ ...box, lat2: e.target.value })} /></div>
                <div className="field"><label htmlFor="lon2">Longitude</label>
                  <input id="lon2" type="text" inputMode="decimal" value={box.lon2} onChange={(e) => setBox({ ...box, lon2: e.target.value })} /></div>
              </div>
            </fieldset>
            <p className="hint">Box size: {sideLat}° × {sideLon}°. Each side must be 2° to 4°.</p>
            <div className="row">
              <button className="btn ghost small" type="button" onClick={useFirstPin} disabled={pinCount < 1}>
                Use my pin as corner 1 {pinCount < 1 ? "(drop a pin on the home page)" : ""}
              </button>
            </div>
          </div>
        </section>

        <section className="card" aria-labelledby="range-h">
          <h2 id="range-h" style={{ fontSize: "1.2rem" }}>2. Years and start</h2>
          <div className="range-row" style={{ marginTop: 12 }}>
            <div className="field"><label htmlFor="cstart">From year</label>
              <input id="cstart" type="number" min={1980} max={2019} value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div className="field"><label htmlFor="cend">To year</label>
              <input id="cend" type="number" min={1980} max={2019} value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <p className="hint" style={{ marginTop: 8 }}>Years 1980 to 2019, 40 years at most.</p>
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={start_} disabled={busy}>
              <Icon name="cloud" size={18} /> {busy ? "Computing…" : "Start computing"}
            </button>
          </div>
        </section>
      </div>

      <section aria-live="polite" aria-labelledby="status-h" style={{ marginTop: 24 }}>
        <h2 id="status-h" style={{ fontSize: "1.2rem" }}>Progress</h2>
        {!job && !error && <div className="card"><p style={{ margin: 0 }}>Nothing running yet. Results are saved on this computer and reused next time.</p></div>}

        {job && (
          <div className="card">
            <div className="row spread" style={{ marginBottom: 8 }}>
              <strong>{job.start} to {job.end}</strong>
              <span className={`badge ${done ? "good" : job.status === "error" ? "bad" : "warm"}`}>
                {done ? "Done" : job.status === "error" ? "Stopped" : "Working"}
              </span>
            </div>
            <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={job.progress} aria-label="Compute progress">
              <span style={{ width: `${job.progress}%` }} />
            </div>
            <p style={{ marginTop: 12 }}>{job.message}</p>
            {done && <p className="hint">Saved as {job.area}.csv. The Explore page charts city data; area charts come in the next version.</p>}
          </div>
        )}

        {error && <div style={{ marginTop: 16 }}><ErrorCard message={error} onRetry={start_} retryLabel="Try again" /></div>}

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Before you start</h3>
          <ol className="checklist" style={{ paddingLeft: 20 }}>
            <li>Add your NASA Earthdata username and password to the backend <code>.env</code> file.</li>
            <li>On earthdata.nasa.gov, approve the end-user licence for MERRA-2 (M2TMNXSLV and M2TMNXFLX).</li>
            <li>Keep this page open. A small range takes minutes; a 40-year range can take much longer.</li>
          </ol>
          <div className="row" style={{ marginTop: 8 }}>
            <Link className="btn ghost small" href="/">Back to the globe</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
