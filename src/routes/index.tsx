import { createFileRoute, Link } from "@tanstack/react-router";
import { Rocket, Satellite, Sparkles, Sun, CalendarClock, Orbit, ArrowRight, Activity } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { GlobeViz } from "@/components/site/GlobeViz";
import { StarField } from "@/components/site/StarField";
import { stats } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mission Control AI — See Everything Above Earth" },
      { name: "description", content: "Real-time satellite tracking, ISS visibility, space weather, and an AI astronomy copilot." },
      { property: "og:title", content: "Mission Control AI — The Celestial Eye" },
      { property: "og:description", content: "See everything above Earth in real time." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Satellite, title: "Satellite Tracking", desc: "Live positions of 28,000+ tracked objects with predictive orbit modeling." },
  { icon: Sparkles, title: "SkyLens AI", desc: "Conversational copilot that explains satellites, events, and the cosmos." },
  { icon: Sun, title: "Space Weather", desc: "Solar flares, geomagnetic storms, and aurora forecasts at a glance." },
  { icon: CalendarClock, title: "Event Prediction", desc: "ISS flyovers, meteor showers, eclipses — personalized to your location." },
  { icon: Orbit, title: "Orbit Intelligence", desc: "LEO · MEO · GEO · HEO visualization with collision risk insights." },
  { icon: Activity, title: "Mission Telemetry", desc: "Enterprise-grade dashboards modeled on real aerospace ops centers." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <StarField />
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pt-16 pb-24 lg:grid-cols-2 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Live telemetry · 9,472 active satellites
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              See Everything
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Above Earth
              </span>
              <br />
              in Real Time.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Track satellites, the ISS, celestial events, and space weather. Explore the universe through an AI astronomy copilot built for mission operators and dreamers alike.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 font-semibold text-background shadow-[0_0_40px_oklch(0.78_0.18_230/0.5)] transition-transform hover:scale-[1.03]"
              >
                <Rocket className="h-4 w-4" />
                Launch Mission Control
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/sky"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-6 py-3 font-semibold backdrop-blur transition-colors hover:border-primary hover:text-primary"
              >
                Explore Sky Above Me
              </Link>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                { label: "Active Satellites", value: stats.activeSatellites.toLocaleString() },
                { label: "Debris Tracked", value: stats.spaceDebris.toLocaleString() },
                { label: "Upcoming Events", value: stats.upcomingEvents.toString() },
              ].map((s) => (
                <div key={s.label} className="glass rounded-xl p-4">
                  <div className="font-display text-2xl font-bold text-primary">{s.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative grid place-items-center">
            <div className="animate-float">
              <GlobeViz size={520} />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-strong rounded-full px-4 py-2 text-xs font-mono text-muted-foreground">
              ALT 408 km · VEL 7.66 km/s · ISS-25544
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Mission Capabilities</div>
          <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">An entire space operations center.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Six integrated systems built on real aerospace telemetry standards.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group relative overflow-hidden glass rounded-2xl p-6 transition-all hover:border-primary/50">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS BAND */}
      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="glass-strong overflow-hidden rounded-3xl p-10">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { value: stats.activeSatellites.toLocaleString(), label: "Active Satellites", sub: "Across LEO · MEO · GEO" },
              { value: stats.spaceDebris.toLocaleString(), label: "Debris Objects", sub: ">10cm tracked by Space-Track" },
              { value: stats.upcomingEvents.toString(), label: "Upcoming Events", sub: "Next 30 days · personalized" },
              { value: stats.trackedObjects.toLocaleString(), label: "Tracked Objects", sub: "Updated every 60 seconds" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-4xl font-bold text-primary sm:text-5xl">{s.value}</div>
                <div className="mt-2 text-sm font-semibold">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="font-display text-4xl font-bold sm:text-5xl">
          Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">go orbital</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Launch into the dashboard and start tracking objects above your horizon in seconds.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 font-semibold text-background shadow-[0_0_40px_oklch(0.78_0.18_230/0.5)]"
        >
          <Rocket className="h-4 w-4" /> Launch Mission Control
        </Link>
      </section>

      <Footer />
    </div>
  );
}
