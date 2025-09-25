"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BACKEND_URL } from "@/lib/api";

const SCENARIO_PRESETS = [
  {
    id: "nyc-express",
    label: "NYC → Chicago Express",
    activity: "Consolidated freight lane",
    payload: { distance: 1000, lat: 40.7128, lon: -74.006 },
  },
  {
    id: "la-micro",
    label: "LA Micro-fulfillment Sprint",
    activity: "EV van orchestration",
    payload: { distance: 380, lat: 34.0522, lon: -118.2437 },
  },
  {
    id: "eu-h2",
    label: "EU Hydrogen Pilot",
    activity: "Hydrogen corridor",
    payload: { distance: 820, lat: 52.520, lon: 13.4050 },
  },
];

const HERO_STATS = [
  { label: "Avg CO₂e saved per route", value: "18.2%" },
  { label: "Playbooks activated", value: "12" },
  { label: "Marketplace projects", value: "32" },
  { label: "Pilot partners", value: "15" },
];

const OPPORTUNITY_TRACKS = [
  {
    title: "Carbon Ops Command",
    summary: "Live telemetry on lanes, fuel mix, and RAG-backed mitigations.",
    tags: ["Live dashboard", "Gemini insights", "Auto alerts"],
  },
  {
    title: "Offset Marketplace",
    summary: "Tokenize credits and co-fund community climate innovation.",
    tags: ["Stripe mocked", "Impact scoring", "SDG alignment"],
  },
  {
    title: "AI Mitigation Copilot",
    summary: "Gemini + RAG w/ EPA & IPCC guidance curated for planners.",
    tags: ["LangChain", "FAISS", "Action buttons"],
  },
];

const INITIAL_STATE = {
  activity: "Consolidated freight lane",
  preset: SCENARIO_PRESETS[0],
  payload: { ...SCENARIO_PRESETS[0].payload },
};

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

export default function Home() {
  const [activity, setActivity] = useState(INITIAL_STATE.activity);
  const [preset, setPreset] = useState(INITIAL_STATE.preset);
  const [payload, setPayload] = useState(INITIAL_STATE.payload);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [decision, setDecision] = useState(null);
  const [emissions, setEmissions] = useState(null);
  const [weather, setWeather] = useState(null);
  const [analysis, setAnalysis] = useState([]);
  const [playbook, setPlaybook] = useState([]);

  const backendLabel = useMemo(
    () => BACKEND_URL.replace(/^https?:\/\//, ""),
    [],
  );

  const isValid = useMemo(() => {
    return [payload.distance, payload.lat, payload.lon].every((value) => {
      return typeof value === "number" && !Number.isNaN(value);
    });
  }, [payload]);

  const selectPreset = (option) => {
    setPreset(option);
    setActivity(option.activity);
    setPayload({ ...option.payload });
  };

  const handleNumericChange = (field) => (event) => {
    const next = Number(event.target.value);
    setPayload((prev) => ({ ...prev, [field]: Number.isNaN(next) ? 0 : next }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setDecision(null);
    setEmissions(null);
    setWeather(null);
    setAnalysis([]);
    setPlaybook([]);

    try {
      const response = await fetch(`${BACKEND_URL}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error ?? "Workflow failed");
      }

      const data = await response.json();
      setResult(data.forecastResult ?? "No suggestion available");
      setDecision(data.decision ?? "pending");
      setEmissions(data.emissions ?? null);
      setWeather(data.weather ?? null);
      setAnalysis(Array.isArray(data.analysisAttempts) ? data.analysisAttempts : []);
      setPlaybook(Array.isArray(data.playbook) ? data.playbook : []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-cyan-500/20 via-indigo-500/10 to-slate-950 pb-24 pt-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6">
          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-wider text-white/70">
                EcoImpactWorkflow • Hackathon Edition
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Forecast carbon, spin up mitigations, and ship offsets in one command center.
              </h1>
              <p className="text-lg text-white/70 sm:max-w-2xl">
                We orchestrate emissions modelling, weather intelligence, Gemini analysis, and marketplace activations so teams can ship greener without slowing operations.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {HERO_STATS.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80">
              <h2 className="text-sm uppercase tracking-wide text-white/40">Launch a forecast</h2>
              <p className="mt-3 text-sm text-white/70">
                Pick a lane, feed the workflow, and watch the AI attempt until it hits confidence.
              </p>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block text-xs uppercase tracking-wide text-white/40">
                  Activity headline
                  <input
                    value={activity}
                    onChange={(event) => setActivity(event.target.value)}
                    placeholder="Consolidated freight lane"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
                  />
                </label>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <label className="flex flex-col gap-1 text-white/50">
                    Distance (km)
                    <input
                      type="number"
                      value={payload.distance}
                      onChange={handleNumericChange("distance")}
                      className="rounded-xl border border-white/10 bg-white/10 p-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-white/50">
                    Latitude
                    <input
                      type="number"
                      value={payload.lat}
                      onChange={handleNumericChange("lat")}
                      className="rounded-xl border border-white/10 bg-white/10 p-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
                      step="0.0001"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-white/50">
                    Longitude
                    <input
                      type="number"
                      value={payload.lon}
                      onChange={handleNumericChange("lon")}
                      className="rounded-xl border border-white/10 bg-white/10 p-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40"
                      step="0.0001"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-2 text-xs sm:grid-cols-3">
                  {SCENARIO_PRESETS.map((option) => {
                    const isActive = preset?.id === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectPreset(option)}
                        className={`rounded-2xl border px-3 py-3 text-left transition ${
                          isActive
                            ? "border-cyan-400/60 bg-cyan-400/20 text-white"
                            : "border-white/10 bg-white/10 text-white/70 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-white/40">
                          {option.activity}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-white/50">
                  <span>Backend: {backendLabel}</span>
                  <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-white/20"
                  >
                    {isSubmitting ? "Running…" : "Launch Forecast"}
                  </button>
                </div>
              </form>

              {error ? (
                <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-100">
                  {error}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <article className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-8 text-white">
              <h2 className="text-xl font-semibold text-white">Workflow output</h2>
              {result ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="text-sm uppercase tracking-wide text-emerald-200/80">{decision} decision</p>
                    <p className="mt-2 text-lg text-white/90">{result}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                      <p className="text-xs uppercase tracking-wide text-white/40">Simulated emissions</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{emissions ?? "+"} kg CO₂e</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                      <p className="text-xs uppercase tracking-wide text-white/40">Weather snapshot</p>
                      <p className="mt-2 text-base text-white/90">{weather ?? "Awaiting forecast"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <p className="text-xs uppercase tracking-wide text-white/40">Gemini analysis attempts</p>
                    <ul className="mt-3 space-y-3">
                      {analysis.map((attempt) => (
                        <li
                          key={attempt.attempt}
                          className="rounded-xl border border-white/10 bg-white/10 px-3 py-3"
                        >
                          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/40">
                            <span>Attempt {attempt.attempt}</span>
                            <span>Confidence {attempt.confidence}</span>
                          </div>
                          <p className="mt-2 text-sm text-white/90">{attempt.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {playbook.length ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-white/40">Launch playbook</p>
                        <Link
                          href="/playbooks"
                          className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                        >
                          View library →
                        </Link>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {playbook.map((phase) => (
                          <div key={phase.phase} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                            <p className="text-xs uppercase tracking-wide text-white/40">{phase.phase}</p>
                            <p className="mt-1 text-sm font-medium text-white">{phase.headline}</p>
                            <ul className="mt-2 space-y-1 text-xs text-white/60">
                              {phase.milestones.map((item) => (
                                <li key={item}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-sm text-white/60">
                  <p>Run the workflow to populate emissions, weather, and AI mitigation recommendations.</p>
                </div>
              )}
            </article>

            <aside className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80">
              <h3 className="text-sm uppercase tracking-wide text-white/40">Opportunity tracks</h3>
              <div className="space-y-5">
                {OPPORTUNITY_TRACKS.map((track) => (
                  <div key={track.title} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-sm font-medium text-white">{track.title}</p>
                    <p className="mt-2 text-xs text-white/60">{track.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {track.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 p-4 text-xs text-cyan-100">
                <p className="font-medium text-cyan-100">Show this in your demo</p>
                <p className="mt-2 text-cyan-50">
                  Jump to the <Link href="/marketplace" className="underline">crowdsourced offset marketplace</Link> and <Link href="/executive" className="underline">exec-ready snapshot</Link> to tell the full story.
                </p>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}