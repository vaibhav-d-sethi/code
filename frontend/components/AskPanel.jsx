"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ErrorCard, Skeleton } from "@/components/States";
import Icon from "@/components/Icon";

const MAX_WORDS = 50;
const STEP_TEXT = ["Reading your question", "Running the numbers", "Writing the answer"];

// The Ask form and its answer. Used on the home page and on /ask.
// initialQuestion fills the box. preset (an id) or autoRun (a question) runs it on load.
export default function AskPanel({ initialQuestion = "", preset = null, autoRun = null }) {
  const [question, setQuestion] = useState(initialQuestion);
  const [presets, setPresets] = useState([]);
  const [state, setState] = useState({ status: "idle" });
  const [step, setStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const ran = useRef(false);

  const words = question.trim() ? question.trim().split(/\s+/).length : 0;
  const tooLong = words > MAX_WORDS;

  useEffect(() => {
    api.presets().then(setPresets).catch(() => {});
  }, []);

  // Run once when arriving with a preset id or a question.
  useEffect(() => {
    if (ran.current) return;
    if (preset) {
      ran.current = true;
      api.presets().then((list) => {
        const p = list.find((x) => x.id === preset);
        if (p) { setQuestion(p.question); ask(p.question); }
      }).catch(() => {});
    } else if (autoRun) {
      ran.current = true;
      ask(autoRun);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.status !== "loading") return;
    const t = setInterval(() => setStep((s) => (s + 1) % STEP_TEXT.length), 2400);
    return () => clearInterval(t);
  }, [state.status]);

  async function ask(text) {
    const q = (text ?? question).trim();
    if (q.length < 3) { setState({ status: "error", message: "Type a question first (at least a few words)." }); return; }
    if (q.split(/\s+/).length > MAX_WORDS) { setState({ status: "error", message: `Please keep it under ${MAX_WORDS} words.` }); return; }
    setStep(0);
    setShowDetails(false);
    setState({ status: "loading" });
    try {
      const data = await api.ask(q);
      setState({ status: "ok", data });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  }

  return (
    <div className="ask-panel">
      <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="ask-form">
        <label htmlFor="question" className="ask-label">One city, one variable, in your own words</label>
        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)}
          placeholder="Was Leh wetter in the 2010s than in the 1980s?" maxLength={600}
          aria-describedby="wc" rows={3} />
        <div className="ask-meta">
          <span id="wc" className={`hint ${tooLong ? "over" : ""}`} aria-live="polite">
            {words}/{MAX_WORDS} words{tooLong ? ". Please shorten it." : ""}
          </span>
          <div className="row" style={{ gap: 10 }}>
            <button type="button" className="text-btn" onClick={() => { setQuestion(""); setState({ status: "idle" }); }}>Clear</button>
            <button className="btn" type="submit" disabled={state.status === "loading" || tooLong || !question.trim()}>
              {state.status === "loading" ? "Working…" : "Ask"} <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>
      </form>

      {presets.length > 0 && (
        <div className="ask-ideas">
          <span className="hint">Or try one:</span>
          {presets.slice(0, 4).map((p) => (
            <button key={p.id} className="chip" onClick={() => { setQuestion(p.question); ask(p.question); }}>
              {p.label}
            </button>
          ))}
          <Link className="chip" href="/presets">All presets</Link>
        </div>
      )}

      <div className="ask-result" aria-live="polite" aria-busy={state.status === "loading"}>
        {state.status === "loading" && (
          <div className="plain-block">
            <p style={{ color: "var(--accent)", margin: "0 0 12px" }}>{STEP_TEXT[step]}…</p>
            <Skeleton height={14} />
            <div style={{ height: 8 }} />
            <Skeleton height={14} width="80%" />
          </div>
        )}

        {state.status === "error" && (
          <ErrorCard message={state.message} onRetry={() => ask()} retryLabel="Try again"
            link={{ href: "/presets", label: "Try a preset" }} />
        )}

        {state.status === "ok" && (
          <div className="plain-block">
            <p className="answer-text">{state.data.answer}</p>
            {!state.data.unsupported && state.data.stats && (
              <div className="row" style={{ marginTop: 12, gap: 8 }}>
                <span className={`badge ${state.data.stats.significant ? "good" : "neutral"}`}>
                  {state.data.stats.significant ? "Significant" : "Not significant"}
                </span>
                <span className="badge neutral">p = {state.data.stats.p_value.toFixed(4)}</span>
              </div>
            )}
            {!state.data.unsupported && state.data.plan && (
              <div style={{ marginTop: 14 }}>
                <Link className="text-link" href={`/explore?city=${state.data.plan.city}&variable=${state.data.plan.variable}&start=${state.data.plan.start_year}&end=${state.data.plan.end_year}`}>
                  See this on the chart →
                </Link>
              </div>
            )}
            {!state.data.unsupported && (
              <details className="more" open={showDetails} onToggle={(e) => setShowDetails(e.currentTarget.open)}>
                <summary>How this was worked out</summary>
                <p className="hint" style={{ marginTop: 8 }}>
                  The question was turned into a plan. Python ran the statistics on the data. The explanation was then written from those numbers.
                </p>
                <pre className="code">{JSON.stringify({ plan: state.data.plan, stats: state.data.stats }, null, 2)}</pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
