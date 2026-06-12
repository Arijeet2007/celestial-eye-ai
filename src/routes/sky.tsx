import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Crosshair, Eye, Star } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { StarField } from "@/components/site/StarField";
import { visibleTonight } from "@/lib/mock-data";

export const Route = createFileRoute("/sky")({
  head: () => ({
    meta: [
      { title: "Sky Above Me — Mission Control AI" },
      { name: "description", content: "What's visible above your location right now: planets, satellites, ISS, and deep-sky objects." },
    ],
  }),
  component: Sky,
});

function Sky() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Personal Sky View</div>
            <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Sky Above Me</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Everything visible from your horizon — planets, satellites, ISS passes, and deep-sky targets.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                defaultValue="Delhi, IN"
                className="rounded-lg border border-border bg-card/50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/20">
              <Crosshair className="h-4 w-4" /> Use my GPS
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Sky Dome */}
          <div className="relative aspect-square overflow-hidden glass-strong rounded-3xl">
            <StarField density={200} />
            <SkyDome />
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-4 gap-px border-t border-border bg-border/40 text-center font-mono text-[10px] uppercase tracking-widest">
              {["N", "E", "S", "W"].map((d) => (
                <div key={d} className="bg-card/70 py-2 text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="absolute left-4 top-4 glass-strong rounded-lg px-3 py-2 font-mono text-[11px]">
              <div className="text-muted-foreground">CONDITIONS</div>
              <div className="font-semibold text-success">Clear · 78% · Bortle 5</div>
            </div>
            <div className="absolute right-4 top-4 glass-strong rounded-lg px-3 py-2 font-mono text-[11px]">
              <div className="text-muted-foreground">OBSERVATION SCORE</div>
              <div className="font-display text-xl font-bold text-primary">8.4 / 10</div>
            </div>
          </div>

          {/* Right: Best tonight */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary">
                <Star className="h-3.5 w-3.5" /> Best Target Tonight
              </div>
              <div className="mt-2 font-display text-2xl font-bold">Jupiter</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Magnitude −2.4, 62° elevation in the SE. Bring binoculars to spot its four Galilean moons.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="rounded-md border border-border bg-background/40 p-2">
                  <div className="text-[9px] uppercase text-muted-foreground">Best</div>
                  <div className="font-semibold">22:40</div>
                </div>
                <div className="rounded-md border border-border bg-background/40 p-2">
                  <div className="text-[9px] uppercase text-muted-foreground">Alt</div>
                  <div className="font-semibold">62°</div>
                </div>
                <div className="rounded-md border border-border bg-background/40 p-2">
                  <div className="text-[9px] uppercase text-muted-foreground">Mag</div>
                  <div className="font-semibold">−2.4</div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Visible Now</div>
              <div className="mt-3 space-y-2">
                {visibleTonight.map((o) => (
                  <div key={o.name} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{o.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {o.type} · {o.azimuth}
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div className="text-primary">{o.altitude}°</div>
                      <div className="text-muted-foreground">{o.best}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-warning">
                <Eye className="h-3.5 w-3.5" /> ISS Visibility
              </div>
              <div className="mt-2 font-display text-xl font-bold">Next pass — 21:14</div>
              <div className="text-sm text-muted-foreground">6 min · peak 67° elevation · W → NE</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SkyDome() {
  const cx = 50;
  const cy = 50;
  const objects = [
    { n: "Jupiter", x: 72, y: 35, c: "oklch(0.85 0.15 80)", r: 4 },
    { n: "Saturn", x: 58, y: 50, c: "oklch(0.8 0.12 80)", r: 3 },
    { n: "ISS", x: 35, y: 25, c: "oklch(0.84 0.16 210)", r: 3 },
    { n: "Sirius", x: 50, y: 60, c: "oklch(0.95 0.05 240)", r: 3 },
    { n: "Orion", x: 60, y: 65, c: "oklch(0.9 0.05 200)", r: 2 },
    { n: "Andromeda", x: 30, y: 40, c: "oklch(0.85 0.08 320)", r: 2.5 },
  ];
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      {/* Altitude circles */}
      {[15, 30, 45].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.78 0.18 230 / 0.2)" strokeWidth="0.15" strokeDasharray="0.5 1" />
      ))}
      {/* Cardinal lines */}
      <line x1={5} y1={50} x2={95} y2={50} stroke="oklch(0.78 0.18 230 / 0.2)" strokeWidth="0.15" />
      <line x1={50} y1={5} x2={50} y2={95} stroke="oklch(0.78 0.18 230 / 0.2)" strokeWidth="0.15" />
      {/* Horizon */}
      <circle cx={cx} cy={cy} r={45} fill="none" stroke="oklch(0.78 0.18 230 / 0.5)" strokeWidth="0.3" />
      {/* Zenith */}
      <circle cx={cx} cy={cy} r={1} fill="oklch(0.78 0.18 230)" />
      <text x={cx + 2} y={cy - 1} fontSize="2" fill="oklch(0.7 0.05 250)">zenith</text>

      {/* Objects */}
      {objects.map((o) => (
        <g key={o.n}>
          <circle cx={o.x} cy={o.y} r={o.r} fill={o.c}>
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={o.x} cy={o.y} r={o.r * 2} fill={o.c} opacity="0.2" />
          <text x={o.x + o.r + 1} y={o.y + 0.5} fontSize="2.2" fill="oklch(0.9 0.02 240)">{o.n}</text>
        </g>
      ))}
    </svg>
  );
}
