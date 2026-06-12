import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Filter } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { upcomingEvents, type SpaceEvent } from "@/lib/mock-data";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Event Prediction Center — Mission Control AI" },
      { name: "description", content: "ISS flyovers, meteor showers, eclipses, and planet visibility forecasts." },
    ],
  }),
  component: Events,
});

const filters = ["All", "ISS Flyover", "Meteor Shower", "Eclipse", "Planet Visibility", "Launch", "Conjunction"];

function visibilityColor(v: SpaceEvent["visibility"]) {
  return v === "Excellent" ? "text-success" : v === "Good" ? "text-primary" : v === "Fair" ? "text-warning" : "text-danger";
}

function Events() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Astronomical Forecast</div>
            <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Event Prediction Center</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">Upcoming flyovers, meteor showers, eclipses, and launches.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-3 py-2 text-sm">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Next 90 days</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider ${
                f === "All" ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Timeline */}
          <div className="space-y-3">
            {upcomingEvents.map((e) => (
              <div key={e.id} className="group relative overflow-hidden glass rounded-2xl p-5 transition-colors hover:border-primary/50">
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-accent opacity-60" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-secondary">{e.type}</div>
                    <h3 className="mt-1 font-display text-xl font-bold">{e.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{e.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold uppercase tracking-widest ${visibilityColor(e.visibility)}`}>
                      ● {e.visibility}
                    </div>
                    <div className="mt-1 font-mono text-sm">{new Date(e.date).toUTCString().slice(0, 22)} UTC</div>
                    {e.duration && <div className="font-mono text-xs text-muted-foreground">Duration: {e.duration}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar mini */}
          <aside className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-primary" /> June 2026
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-mono">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="text-muted-foreground">{d}</div>
                ))}
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const hasEvent = [12, 15].includes(day);
                  return (
                    <div
                      key={day}
                      className={`aspect-square grid place-items-center rounded-md text-[11px] ${
                        hasEvent
                          ? "bg-primary/20 text-primary font-bold ring-1 ring-primary/40"
                          : "text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">This Week</div>
              <div className="mt-3 font-display text-3xl font-bold text-primary">5</div>
              <div className="text-sm">Observable events</div>
              <div className="mt-3 text-xs text-muted-foreground">2 ISS passes · 1 launch · 2 conjunctions</div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
