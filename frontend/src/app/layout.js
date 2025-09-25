import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const NAV_LINKS = [
  { href: "/", label: "Command Center" },
  { href: "/marketplace", label: "Offset Marketplace" },
  { href: "/playbooks", label: "AI Playbooks" },
  { href: "/executive", label: "Executive Mode" },
];

export const metadata = {
  title: "EcoImpactApp – Carbon Intelligence Hackathon Stack",
  description:
    "Mocked carbon forecasting workflow with AI mitigations, offset marketplace, and executive-ready storytelling.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 antialiased`}>
        <div className="relative">
          <nav className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
              <Link href="/" className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
                EcoImpactApp
              </Link>
              <div className="flex items-center gap-4 text-xs text-white/60">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-cyan-400/40 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <span className="hidden text-[11px] uppercase tracking-widest text-white/40 sm:inline">
                Hackathon-ready mock
              </span>
            </div>
          </nav>

          {children}

          <footer className="border-t border-white/5 bg-slate-950/80">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
              <p>EcoImpactApp · no live keys · ready for demo storytelling</p>
              <div className="flex flex-wrap gap-3">
                <span>Workflow API mock</span>
                <span>Gemini loop simulation</span>
                <span>Offset marketplace prototype</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
