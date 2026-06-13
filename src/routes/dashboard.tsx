import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Satellite as SatIcon, Orbit, Radio, AlertTriangle, Plus } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { GlobeViz } from "@/components/site/GlobeViz";
import { RealisticGlobe } from "@/components/site/RealisticGlobe";
import { StarField } from "@/components/site/StarField";
import { AIChat } from "@/components/site/AIChat";
import { satellites, issPosition, spaceWeather, upcomingEvents, stats } from "@/lib/mock-data";


export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Mission Control Dashboard — Mission Control AI" },
      { name: "description", content: "Live globe, satellite telemetry, space weather, and AI copilot in one ops view." },
    ],
  }),
  component: Dashboard,
});

const categories = ["All", "Communications", "Earth Observation", "Navigation", "Science", "Crewed", "Military"];

function Dashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[280px_1fr_320px]">
        {/* LEFT SIDEBAR */}
        <aside className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Search</div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="NORAD ID or name…"
                className="w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-wider ${
                    c === "All"
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tracked Satellites</div>
              <button className="grid h-6 w-6 place-items-center rounded-md border border-border text-primary hover:bg-primary/10">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-3 space-y-1">
              {satellites.slice(0, 6).map((s) => (
                <Link
                  key={s.id}
                  to="/satellite/$id"
                  params={{ id: s.id }}
                  className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-primary">
                    <SatIcon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {s.orbit} · {s.altitudeKm.toLocaleString()} km
                    </div>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                </Link>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-accent">
                <Radio className="h-3.5 w-3.5 text-background" />
              </span>
              <div>
                <div className="text-sm font-semibold">ISS Tracker</div>
                <div className="text-[10px] uppercase tracking-widest text-success">● Live</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
              <Telemetry label="Latitude" value={`${issPosition.lat.toFixed(2)}°`} />
              <Telemetry label="Longitude" value={`${issPosition.lng.toFixed(2)}°`} />
              <Telemetry label="Altitude" value={`${issPosition.altitudeKm} km`} />
              <Telemetry label="Velocity" value={`${issPosition.velocityKms} km/s`} />
              <Telemetry label="Crew" value={String(issPosition.crew)} />
              <Telemetry label="Orbit" value="51.6°" />
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Debris Monitor</div>
            <div className="mt-2 font-display text-3xl font-bold text-warning">{stats.spaceDebris.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Tracked objects &gt;10 cm</div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-3/4 bg-gradient-to-r from-warning to-danger" />
            </div>
          </div>
        </aside>

        {/* CENTER GLOBE */}
        <main className="space-y-4">
          <div className="relative glass-strong overflow-hidden rounded-2xl">
            <StarField className="opacity-60" />
            <div className="grid-bg absolute inset-0 opacity-30" />

            <div className="relative flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="font-mono text-xs uppercase tracking-widest">
                  {globeMode === "stylized" ? "Real-time orbital view" : "Realistic earth view"}
                </span>
              </div>
              <div className="flex rounded-md border border-border bg-background/40 p-0.5">
                {(["stylized", "realistic"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setGlobeMode(m)}
                    className={`rounded px-3 py-1 text-[10px] uppercase tracking-widest transition ${
                      globeMode === m
                        ? "bg-primary text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {globeMode === "stylized" ? (
              <div className="relative grid place-items-center py-10 sm:py-16">
                <GlobeViz size={520} />
              </div>
            ) : (
              <div className="relative p-4">
                <RealisticGlobe size={520} />
              </div>
            )}


            <div className="relative grid grid-cols-2 gap-px border-t border-border bg-border/50 sm:grid-cols-4">
              {[
                { label: "UTC", value: new Date().toUTCString().slice(17, 25) },
                { label: "Visible", value: "1,247" },
                { label: "Tracking", value: "8" },
                { label: "Sun Angle", value: "−12°" },
              ].map((c) => (
                <div key={c.label} className="bg-card/60 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</div>
                  <div className="font-mono text-sm font-semibold">{c.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Visible Objects", value: "1,247", trend: "+3.2%", color: "text-secondary" },
              { label: "Active Missions", value: "324", trend: "+1.1%", color: "text-primary" },
              { label: "Debris Count", value: stats.spaceDebris.toLocaleString(), trend: "+0.4%", color: "text-warning" },
              { label: "Orbits / hr", value: "16.2", trend: "stable", color: "text-success" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className={`mt-2 font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.trend}</div>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-4">
          <AIChat compact />

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Space Weather</div>
              <span className="rounded-md bg-warning/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-warning">G1 Storm</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Telemetry label="Kp Index" value={spaceWeather.kpIndex.toFixed(1)} />
              <Telemetry label="Solar Flux" value={spaceWeather.solarFlux.toString()} />
              <Telemetry label="Solar Wind" value={`${spaceWeather.solarWindKms} km/s`} />
              <Telemetry label="Proton Flux" value={spaceWeather.protonFlux.toFixed(2)} />
            </div>
            <Link to="/weather" className="mt-3 block text-center text-xs text-primary hover:underline">
              Open Space Weather Center →
            </Link>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-warning" /> Event Notifications
            </div>
            <div className="mt-3 space-y-2">
              {upcomingEvents.slice(0, 3).map((e) => (
                <div key={e.id} className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <div className="text-[10px] uppercase tracking-widest text-primary">{e.type}</div>
                  <div className="mt-0.5 text-sm font-medium">{e.title}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{new Date(e.date).toUTCString().slice(5, 22)} UTC</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-sm font-semibold">Recommended for You</div>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2"><Orbit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" /> Track JWST L2 halo orbit</div>
              <div className="flex items-start gap-2"><Orbit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" /> Watch Starlink train tonight</div>
              <div className="flex items-start gap-2"><Orbit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" /> Solar transit prediction window</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Telemetry({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-mono text-xs font-semibold text-foreground">{value}</div>
    </div>
  );
}
