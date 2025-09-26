"use client";

import { useEffect, useMemo, useState } from "react";

import { BACKEND_URL } from "@/lib/api";

const FALLBACK_SNAPSHOT = {
  headline: "12.4% carbon intensity drop this sprint",
  weeklyCarbonDelta: -12.4,
  runsOptimized: 18,
  teamSentiment: 4.6,
  wins: [
    "Swapped 6 lanes to regenerative diesel",
    "Activated 142 offset credits via marketplace",
    "Launched API integration with ERP for auto-mitigation tasks",
  ],
  focus: [
    "Expand hydrogen pilot to Midwest corridor",
    "Codify sustainability OKRs in driver scorecards",
    "Publish RAG-backed mitigation newsletter",
  ],
};

function MetricCard({ label, value, tone = "default" }) {
  const toneClasses = {
    success: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    warning: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    default: "border-white/10 bg-white/10 text-white/80",
  };

  return (
    <div className={`rounded-3xl border p-6 ${toneClasses[tone] ?? toneClasses.default}`}>
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function ExecutivePage() {
  const [snapshot, setSnapshot] = useState(FALLBACK_SNAPSHOT);
  const [state, setState] = useState("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSnapshot() {
      setState("loading");
      try {
        const response = await fetch(`${BACKEND_URL}/executive-snapshot`, { signal: controller.signal });
        if (!response.ok) throw new Error("Failed to load snapshot");
        const data = await response.json();
        if (data?.snapshot) {
          setSnapshot({ ...FALLBACK_SNAPSHOT, ...data.snapshot });
        }
        setState("ready");
      } catch (error) {
        if (error.name !== "AbortError") {
          setState("ready");
        }
      }
    }

    loadSnapshot();
    return () => controller.abort();
  }, []);

  const weeklyDeltaLabel = useMemo(() => {
    const delta = snapshot.weeklyCarbonDelta ?? 0;
    return `${delta > 0 ? "+" : ""}${delta.toFixed(1)}% vs last week`;
  }, [snapshot.weeklyCarbonDelta]);

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-20 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-wider text-white/70">
            Executive Mode
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Ready-to-share snapshot for investors and leadership.
          </h1>
          <p className="text-lg text-white/70 sm:max-w-3xl">
            Close the conversation with a punchy recap. These numbers rely on staged data, but the experience proves you can translate operations into impact narratives.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <MetricCard label="Weekly carbon delta" value={weeklyDeltaLabel} tone={snapshot.weeklyCarbonDelta < 0 ? "success" : "warning"} />
          <MetricCard label="Runs optimized" value={snapshot.runsOptimized} />
          <MetricCard label="Team sentiment" value={`${snapshot.teamSentiment}/5`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white/80">
            <h2 className="text-lg font-semibold text-white">Wins this sprint</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {snapshot.wins?.map((item) => (
                <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white/80">
            <h2 className="text-lg font-semibold text-white">Focus for next sprint</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {snapshot.focus?.map((item) => (
                <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-400/40 bg-cyan-400/10 p-6 text-white">
          <h2 className="text-lg font-semibold">How to narrate it</h2>
          <div className="mt-4 grid gap-3 text-sm text-cyan-50 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Hook</p>
              <p className="mt-2">“We just unlocked a {Math.abs(snapshot.weeklyCarbonDelta).toFixed(1)}% drop in carbon intensity.”</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Proof</p>
              <p className="mt-2">“Here are the lanes and offsets that made it happen, all tracked in EcoImpact.”</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Ask</p>
              <p className="mt-2">“Back our hydrogen + marketplace expansion to halve footprint within 6 months.”</p>
            </div>
          </div>
          <p className="mt-6 text-xs uppercase tracking-wide text-white/60">Data source: {state === "loading" ? "loading" : "sandbox API"}</p>
        </section>
      </div>
    </main>
  );
}
