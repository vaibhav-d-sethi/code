"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AskPanel from "@/components/AskPanel";
import { Skeleton } from "@/components/States";

export default function AskPage() {
  return (
    <Suspense fallback={<div className="container section"><Skeleton height={300} /></div>}>
      <AskQuestion />
    </Suspense>
  );
}

function AskQuestion() {
  const params = useSearchParams();
  return (
    <div className="container section ask-zone">
      <p className="eyebrow">Ask</p>
      <h1 style={{ fontSize: "clamp(1.8rem,3.6vw,2.6rem)" }}>Ask about the climate record</h1>
      <p className="lede" style={{ marginBottom: 28 }}>
        Name one city and one variable. A plan is made from your question, Python does the statistics, and the result is explained in plain words.
      </p>
      <div className="glass ask-glass">
        <AskPanel
          initialQuestion={params.get("q") || ""}
          preset={params.get("preset")}
          autoRun={params.get("q")}
        />
      </div>
    </div>
  );
}
