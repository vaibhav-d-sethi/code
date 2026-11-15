"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { CITY_BLURB } from "@/lib/cityArt";
import Chart from "@/components/Chart";
import CityArt from "@/components/CityArt";
import StatCard from "@/components/StatCard";
import Forecast from "@/components/Forecast";
import { ErrorCard, Skeleton } from "@/components/States";

const MIN_YEAR = 1980, MAX_YEAR = 2019;
const TREND_TEXT = { increasing: "Getting higher", decreasing: "Getting lower", "no trend": "No clear change" };

function fmtP(p) {
  if (p == null) return "n/a";
  return p < 0.0001 ? "< 0.0001" : p.toFixed(4);
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="container section"><Skeleton height={420} /></div>}>
      <Explore />
    </Suspense>
  );
}

function Explore() {
  const params = useSearchParams();
  const [cities, setCities] = useState([]);
  const [variables, setVariables] = useState([]);
  const [city, setCity] = useState(params.get("city") || "lucknow");
  const [variable, setVariable] = useState(params.get("variable") || "T2M_C");
  const [start, setStart] = useState(Number(params.get("start")) || MIN_YEAR);
  const [end, setEnd] = useState(Number(params.get("end")) || MAX_YEAR);
  const [resolution, setResolution] = useState("monthly");
  const [state, setState] = useState({ status: "idle" });
  const [reloadKey, setReloadKey] = useState(0);
  const [rangeError, setRangeError] = useState("");

  useEffect(() => {
    api.cities().then(setCities).catch(() => {});
    api.variables().then(setVariables).catch(() => {});
  }, []);

  useEffect(() => {
    if (start >= end) { setRangeError("The end year must be later than the start year."); return; }
    setRangeError("");
    const ctrl = { cancelled: false };
    setState({ status: "loading" });
    const q = { city, variable, start, end, resolution };
    Promise.all([api.series(q), api.trend({ city, variable, start, end })])
      .then(([series, trend]) => { if (!ctrl.cancelled) setState({ status: "ok", series, trend }); })
      .catch((err) => { if (!ctrl.cancelled) setState({ status: "error", message: err.message }); });
    return () => { ctrl.cancelled = true; };
  }, [city, variable, start, end, resolution, reloadKey]);

  const cityName = cities.find((c) => c.id === city)?.name || city;
  const varMeta = variables.find((v) => v.id === variable);
  const unit = varMeta?.unit || "";
  const title = `${cityName}: ${varMeta?.label || "Value"} by ${resolution === "monthly" ? "month" : resolution === "quarterly" ? "quarter" : "year"}`;

  const trend = state.trend;
  const change = useMemo(() => {
    if (!trend) return null;
    const sign = trend.sen_per_decade > 0 ? "+" : "";
    return `${sign}${trend.sen_per_decade.toFixed(2)} ${unit} per decade`;
  }, [trend, unit]);

  return (
    <div className="container section">
      <p className="eyebrow">Explore</p>
      <h1 style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)" }}>Explore a city’s climate record</h1>
      <p className="lede" style={{ marginBottom: 28 }}>Pick a place and a variable. The chart and numbers update straight away.</p>

      <Forecast city={city} />

      <div className="explore">
        <aside className="controls" aria-label="Choose what to analyse">
          <section className="card" aria-labelledby="city-h">
            <h2 id="city-h" style={{ fontSize: "1.1rem" }}>1. Choose a city</h2>
            <div className="grid" style={{ gap: 8, marginTop: 12 }}>
              {(cities.length ? cities : Object.keys(CITY_BLURB).map((id) => ({ id, name: id }))).map((c) => (
                <button
                  key={c.id}
                  className={`chip ${city === c.id ? "selected" : ""}`}
                  aria-pressed={city === c.id}
                  onClick={() => setCity(c.id)}
                  style={{ justifyContent: "flex-start", width: "100%", padding: 0, overflow: "hidden", borderRadius: 14, background: "var(--panel-solid)" }}
                >
                  <span style={{ width: 96, height: 56, flex: "0 0 96px" }} aria-hidden="true"><CityArt id={c.id} /></span>
                  <span style={{ padding: "0 12px", fontWeight: 700 }}>{c.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card" aria-labelledby="var-h">
            <h2 id="var-h" style={{ fontSize: "1.1rem" }}>2. Choose a variable</h2>
            <div className="segmented" role="group" aria-label="Variable" style={{ marginTop: 12 }}>
              {(variables.length ? variables : [{ id: "T2M_C", label: "Air temperature" }, { id: "PRECTOTCORR_mm", label: "Rainfall" }]).map((v) => (
                <button key={v.id} aria-pressed={variable === v.id} onClick={() => setVariable(v.id)}>
                  {v.id === "T2M_C" ? "Air temperature" : "Rainfall"}
                </button>
              ))}
            </div>
          </section>

          <section className="card" aria-labelledby="period-h">
            <h2 id="period-h" style={{ fontSize: "1.1rem" }}>3. Choose the years</h2>
            <div className="range-row" style={{ marginTop: 12 }}>
              <div className="field">
                <label htmlFor="start">From</label>
                <input id="start" type="number" min={MIN_YEAR} max={MAX_YEAR} value={start}
                  onChange={(e) => setStart(Number(e.target.value))} />
              </div>
              <div className="field">
                <label htmlFor="end">To</label>
                <input id="end" type="number" min={MIN_YEAR} max={MAX_YEAR} value={end}
                  onChange={(e) => setEnd(Number(e.target.value))} />
              </div>
            </div>
            <div className="hint" style={{ marginTop: 8 }}>Available: {MIN_YEAR} to {MAX_YEAR}.</div>
            {rangeError && <div className="hint over" role="alert">{rangeError}</div>}
            <div style={{ marginTop: 12 }}>
              <div className="label" style={{ fontWeight: 700, fontSize: ".92rem", marginBottom: 6 }}>Resolution</div>
              <div className="segmented" role="group" aria-label="Resolution">
                {["monthly", "quarterly", "yearly"].map((r) => (
                  <button key={r} aria-pressed={resolution === r} onClick={() => setResolution(r)}>
                    {r[0].toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="hint">
            Need a different range or fresh NASA data? <Link href="/compute">Compute it from NASA Earthdata</Link>.
          </div>
        </aside>

        <section aria-live="polite" aria-busy={state.status === "loading"}>
          {state.status === "error" && (
            <ErrorCard message={state.message} onRetry={() => setReloadKey((k) => k + 1)}
              link={{ href: "/presets", label: "Try a preset" }} />
          )}

          {state.status !== "error" && (
            <div className="card">
              {state.status === "loading" || state.status === "idle" ? (
                <Skeleton height={420} />
              ) : (
                <Chart dates={state.series.dates} values={state.series.values} title={title} unit={unit} />
              )}
            </div>
          )}

          {state.status === "ok" && trend && (
            <>
              <div className="stats-grid" role="list" aria-label="Key results">
                <div role="listitem" style={{ display: "contents" }}>
                  <StatCard label="Direction" value={TREND_TEXT[trend.trend] || trend.trend} />
                </div>
                <div role="listitem" style={{ display: "contents" }}>
                  <StatCard label="Rate of change" value={change} />
                </div>
                <div role="listitem" style={{ display: "contents" }}>
                  <StatCard label="p-value" value={fmtP(trend.p_value)} />
                </div>
                <div role="listitem" style={{ display: "contents" }}>
                  <StatCard label="Confidence" value={trend.significant ? "Significant" : "Not significant"}
                    tone={trend.significant ? "good" : "neutral"} />
                </div>
              </div>

              <div className="card" style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: "1.2rem" }}>Before and after</h2>
                <p style={{ margin: 0 }}>
                  Compared with the normal value for each calendar month, the first ten years averaged{" "}
                  <strong style={{ color: "var(--text)" }}>{trend.first_decade_mean > 0 ? "+" : ""}{trend.first_decade_mean} {unit}</strong>, and the last ten years{" "}
                  <strong style={{ color: "var(--text)" }}>{trend.last_decade_mean > 0 ? "+" : ""}{trend.last_decade_mean} {unit}</strong>. A t-test on these two
                  decades gives p = {fmtP(trend.welch_p_value)}.
                </p>
                <p className="hint" style={{ marginTop: 12 }}>
                  Trend tests use monthly values with the normal seasonal cycle removed, so the test looks at change, not the seasons.
                  {" "}{cityName} is one place. It does not show a global trend.
                </p>
              </div>
            </>
          )}

          <div className="row" style={{ marginTop: 20 }}>
            <Link className="btn" href={`/ask?q=${encodeURIComponent(`Has ${varMeta?.label?.toLowerCase() || "the variable"} in ${cityName} changed between ${start} and ${end}?`)}`}>
              Ask about this
            </Link>
            <span className="hint">{CITY_BLURB[city]}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
