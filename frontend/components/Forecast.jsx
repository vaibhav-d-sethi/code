"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/States";

// Three-day forecast for one city. Separate from the statistics: it is a live forecast, not the record.
export default function Forecast({ city }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    api.forecast(city, 3)
      .then((data) => { if (alive) setState({ status: "ok", data }); })
      .catch((err) => { if (alive) setState({ status: "error", message: err.message }); });
    return () => { alive = false; };
  }, [city]);

  return (
    <section className="forecast glass" aria-labelledby="fc-title">
      <div className="forecast-head">
        <h2 id="fc-title">Next 3 days</h2>
        {state.status === "ok" && <span className="hint">{state.data.source} · {state.data.fetched_at.replace("T", " ")} UTC</span>}
      </div>

      {state.status === "loading" && <Skeleton height={96} />}

      {state.status === "error" && (
        <p className="hint" role="status">{state.message}</p>
      )}

      {state.status === "ok" && (
        <div className="forecast-days">
          {state.data.days.map((d) => (
            <article key={d.date} className="forecast-day">
              <p className="forecast-weekday">{d.weekday}</p>
              <p className="forecast-label">{d.label}</p>
              <p className="forecast-temp">
                <strong>{Math.round(d.temp_max_c)}°</strong>
                <span> / {Math.round(d.temp_min_c)}°C</span>
              </p>
              <p className="hint">
                Rain {d.rain_mm.toFixed(1)} mm · {d.rain_chance_pct ?? 0}% chance
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
