"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BACKEND_URL } from "@/lib/api";

const FALLBACK_STRATEGIES = [
  {
    id: "strategy-modal-shift",
    name: "Modal Shift to Rail + Microhubs",
    category: "Logistics",
    expectedReduction: "-38%",
    playbook: [
      "Stand up 2 regional micro-fulfillment hubs",
      "Integrate rail API for live capacity swaps",
      "Gamify carrier engagement with scorecards",
    ],
  },
  {
    id: "strategy-h2",
    name: "Hydrogen-ready Fleet Pilot",
    category: "Fleet",
    expectedReduction: "-21%",
    playbook: [
      "Lease 10 fuel-cell trucks in California ZEV corridor",
      "Install mobile electrolyzer pods at partner depots",
      "Instrument telemetry for energy-per-drop KPI",
    ],
  },
  {
    id: "strategy-rag",
    name: "AI-powered Mitigation RAG",
    category: "AI",
    expectedReduction: "-17%",
    playbook: [
      "Index EPA SmartWay + IPCC AR6 briefs into vector store",
      "Launch Gemini action copilot for route planners",
      "Trigger auto-mitigation tasks into Asana via webhook",
    ],
  },
];

const RAG_CALL_TO_ACTION = [
  "Drop PDFs into a vector store (FAISS/Pinecone)",
  "Embed with text-embedding-004",
  "Augment Gemini prompt with top k passages",
  "Return JSON instructions for Ops team",
];

export default function PlaybooksPage() {
  const [strategies, setStrategies] = useState(FALLBACK_STRATEGIES);
  const [state, setState] = useState("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStrategies() {
      setState("loading");
      try {
        const response = await fetch(`${BACKEND_URL}/strategy-library`, { signal: controller.signal });
        if (!response.ok) throw new Error("Failed to fetch strategies");
        const data = await response.json();
        if (Array.isArray(data?.strategies) && data.strategies.length) {
          setStrategies(
            data.strategies.map((item) => ({
              playbook: [],
              category: "",
              expectedReduction: "",
              ...item,
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

    loadStrategies();
    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 pb-24 pt-20 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-wider text-white/70">
            AI Mitigation Playbooks
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Plug-and-play strategies your leadership can deploy — powered by Gemini + RAG.
          </h1>
          <p className="text-lg text-white/70 sm:max-w-3xl">
            Show how the workflow converts emissions insights into action. These playbooks run on staged data, but demonstrate structured plans, AI assistance, and team alignment.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {strategies.map((strategy) => (
            <article
              key={strategy.id}
              className="rounded-3xl border border-white/10 bg-white/10 p-6 text-white/80"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/40">
                <span>{strategy.category}</span>
                <span>{strategy.expectedReduction}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-white">{strategy.name}</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {strategy.playbook?.map((item) => (
                  <li key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-cyan-400/40 bg-cyan-400/10 p-6 text-white">
            <h3 className="text-lg font-semibold">RAG-powered mitigation planner</h3>
            <p className="mt-3 text-sm text-cyan-50">
              Pair Gemini with a knowledge base to deliver defensible, data-backed recommendations. Keep it sandboxed, but highlight the architecture.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
              {RAG_CALL_TO_ACTION.map((item) => (
                <li key={item} className="rounded-2xl border border-white/20 bg-white/10 px-3 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <aside className="space-y-3 text-xs text-white/60">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <h4 className="text-sm font-semibold text-white">Demo flow</h4>
              <p className="mt-2">
                Run a forecast → Open this page → highlight the AI playbook → invite stakeholders to imagine uploading their own PDFs.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <h4 className="text-sm font-semibold text-white">Next step</h4>
              <p className="mt-2">
                Show the <Link href="/executive" className="text-cyan-200 hover:text-cyan-100">Executive mode</Link> page to prove storytelling for leaders.
              </p>
              <p className="mt-3 text-xs uppercase tracking-wide text-white/40">State: {state === "loading" ? "loading" : "sandbox API"}</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
