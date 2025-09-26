"use client";

import { useEffect, useMemo, useState } from "react";

import { BACKEND_URL } from "@/lib/api";

const FALLBACK_PROJECTS = [
  {
    id: "project-urban-forest",
    title: "Bronx Urban Forest Pods",
    summary: "Plant modular forests cooling trucking corridors with community revenue share.",
    pricePerTonne: 14.5,
    expectedImpact: "1,200 tCO₂e avoided",
    sdgAlignment: ["SDG 11", "SDG 13", "SDG 15"],
    status: "funding",
  },
  {
    id: "project-blue-carbon",
    title: "Gulf Coast Blue Carbon Labs",
    summary: "Autonomous drones restore wetlands and capture methane hotspots.",
    pricePerTonne: 22,
    expectedImpact: "2,750 tCO₂e sequestered",
    sdgAlignment: ["SDG 9", "SDG 13", "SDG 14"],
    status: "live",
  },
  {
    id: "project-biochar",
    title: "Appalachia Biochar Collective",
    summary: "Convert sawmill waste into regenerative soil biochar with profit sharing.",
    pricePerTonne: 18.75,
    expectedImpact: "950 tCO₂e locked per cycle",
    sdgAlignment: ["SDG 8", "SDG 12", "SDG 13"],
    status: "waitlist",
  },
];

const STATUS_STYLES = {
  live: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  funding: "border-cyan-400/40 bg-cyan-400/10 text-cyan-100",
  waitlist: "border-white/20 bg-white/5 text-white/70",
};

export default function MarketplacePage() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [state, setState] = useState("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      setState("loading");
      try {
        const response = await fetch(`${BACKEND_URL}/offset-projects`, { signal: controller.signal });
        if (!response.ok) throw new Error("Failed to load projects");
        const data = await response.json();
        if (Array.isArray(data?.projects) && data.projects.length) {
          setProjects(
            data.projects.map((project) => ({
              pricePerTonne: 0,
              expectedImpact: "",
              sdgAlignment: [],
              status: "funding",
              ...project,
            })),
          );
        }
        setState("ready");
      } catch (error) {
        if (error.name !== "AbortError") {
          setState("ready");
        }
      }
    }

    loadProjects();
    return () => controller.abort();
  }, []);

  const activeCount = useMemo(
    () => projects.filter((project) => project.status === "live").length,
    [projects],
  );

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-20 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-wider text-white/70">
            Crowdsourced Carbon Offset Marketplace
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Let users co-invest in climate projects and attach offsets to every forecast.
          </h1>
          <p className="text-lg text-white/70 sm:max-w-3xl">
            Showcase a tangible path from forecasting to action. These listings run on staged data, but the API + UI prove the revenue model. Plug Stripe or crypto rails later without rewriting the experience.
          </p>

          <div className="flex flex-wrap gap-6 text-sm text-white/60">
            <div>
              <span className="text-3xl font-semibold text-white">{projects.length}</span>
              <p className="mt-1 text-xs uppercase tracking-wide">Projects curated</p>
            </div>
            <div>
              <span className="text-3xl font-semibold text-white">{activeCount}</span>
              <p className="mt-1 text-xs uppercase tracking-wide">Live right now</p>
            </div>
            <div>
              <span className="text-3xl font-semibold text-white">$12.8k</span>
              <p className="mt-1 text-xs uppercase tracking-wide">Sandbox volume processed</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => {
            const statusClass = STATUS_STYLES[project.status] ?? STATUS_STYLES.waitlist;
            return (
              <article
                key={project.id}
                className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/10 p-6"
              >
                <div className="space-y-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-wide ${statusClass}`}
                  >
                    {project.status}
                  </span>
                  <h2 className="text-xl font-semibold text-white">{project.title}</h2>
                  <p className="text-sm text-white/70">{project.summary}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-white/40">Price per tonne</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        ${project.pricePerTonne?.toFixed?.(2) ?? project.pricePerTonne}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-white/40">Impact</p>
                      <p className="mt-1 text-sm font-medium text-white">{project.expectedImpact}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-white/70">
                    {project.sdgAlignment?.map((sdg) => (
                      <span key={sdg} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {sdg}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-6 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-400/20"
                >
                  Preview checkout →
                </button>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-sm text-white/70">
            <h3 className="text-lg font-semibold text-white">How to pitch it</h3>
            <ul className="mt-4 space-y-3">
              <li>• Start with a forecast on the command center page.</li>
              <li>• Jump here to show how users can neutralize remaining emissions.</li>
              <li>• Point out the prewired Stripe integration — production keys drop in later.</li>
              <li>• Highlight SDG alignment badges to satisfy ESG scorecards.</li>
            </ul>
          </div>
          <div className="space-y-3 text-xs text-white/60">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <h4 className="text-sm font-semibold text-white">Why it matters</h4>
              <p className="mt-3">
                Investors want monetization plus climate impact. This marketplace gives you both, without needing live infrastructure.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-400/40 bg-cyan-400/10 p-6 text-white/80">
              <h4 className="text-sm font-semibold text-white">State</h4>
              <p className="mt-3 text-xs uppercase tracking-wide text-white/70">
                Data source: {state === "loading" ? "loading" : "sandbox API"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
