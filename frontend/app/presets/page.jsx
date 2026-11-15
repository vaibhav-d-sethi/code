"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ErrorCard, Skeleton } from "@/components/States";
import Icon from "@/components/Icon";

const NAMES = { lucknow: "Lucknow", jaisalmer: "Jaisalmer", kochi: "Kochi", shimla: "Shimla", leh: "Leh" };

export default function PresetsPage() {
  const [presets, setPresets] = useState(null);
  const [error, setError] = useState("");
  const [city, setCity] = useState("all");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setError("");
    api.presets().then(setPresets).catch((e) => setError(e.message));
  }, [reload]);

  const visible = useMemo(() => {
    if (!presets) return [];
    return city === "all" ? presets : presets.filter((p) => p.city === city);
  }, [presets, city]);

  return (
    <div className="container section">
      <p className="eyebrow">Presets</p>
      <h1 style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)" }}>Twenty questions, ready to ask</h1>
      <p className="lede">Each preset runs the same live pipeline as the Ask page. Answers are worked out fresh every time.</p>

      <div className="row" style={{ margin: "24px 0" }} role="group" aria-label="Filter by city">
        {["all", "lucknow", "jaisalmer", "kochi", "shimla", "leh"].map((c) => (
          <button key={c} className="chip" aria-pressed={city === c} onClick={() => setCity(c)}>
            {c === "all" ? "All cities" : NAMES[c]}
          </button>
        ))}
      </div>

      {error && <ErrorCard message={error} onRetry={() => setReload((r) => r + 1)} />}
      {!error && !presets && (
        <div className="grid grid-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={120} />)}</div>
      )}

      {presets && (
        <div className="grid grid-3">
          {visible.map((p) => (
            <Link key={p.id} href={`/ask?preset=${p.id}`} className="card lift" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="row spread" style={{ marginBottom: 10 }}>
                <span className="badge neutral">{NAMES[p.city] || p.city}</span>
                <Icon name="chat" size={20} />
              </div>
              <h3 style={{ fontSize: "1.02rem" }}>{p.label}</h3>
              <p style={{ margin: 0, fontSize: ".9rem" }}>{p.question}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
