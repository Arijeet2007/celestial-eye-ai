import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Satellite as SatIcon, Sparkles } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { GlobeViz } from "@/components/site/GlobeViz";
import { StarField } from "@/components/site/StarField";
import { satellites } from "@/lib/mock-data";

export const Route = createFileRoute("/satellite/$id")({
  loader: ({ params }) => {
    const sat = satellites.find((s) => s.id === params.id);
    if (!sat) throw notFound();
    return { sat };
  },
  errorComponent: ({ reset }) => (
    <div className="min-h-screen p-10">
      <Navbar />
      <div className="mx-auto mt-10 max-w-md text-center">
        <h1 className="font-display text-2xl font-bold">Satellite not found</h1>
        <button onClick={reset} className="mt-4 rounded-md bg-primary px-4 py-2 text-background">Retry</button>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto mt-20 max-w-md text-center">
        <h1 className="font-display text-3xl font-bold">Satellite not found</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-primary hover:underline">← Back to dashboard</Link>
      </div>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.sat.name ?? "Satellite"} — Mission Control AI` },
      { name: "description", content: `Live telemetry and orbital intelligence for ${loaderData?.sat.name}.` },
    ],
  }),
  component: SatellitePage,
});

function SatellitePage() {
  const { sat } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Mission Control
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <SatIcon className="h-7 w-7 text-background" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-primary">{sat.type}</div>
              <h1 className="mt-1 font-display text-4xl font-bold">{sat.name}</h1>
              <div className="font-mono text-sm text-muted-foreground">NORAD {sat.noradId} · {sat.operator}</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> {sat.status}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="relative overflow-hidden glass-strong rounded-3xl p-6">
            <StarField className="opacity-50" />
            <div className="relative grid place-items-center py-6">
              <GlobeViz size={420} showSatellites={false} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Altitude" value={`${sat.altitudeKm.toLocaleString()} km`} />
            <Stat label="Velocity" value={`${sat.velocityKms} km/s`} />
            <Stat label="Inclination" value={`${sat.inclination}°`} />
            <Stat label="Orbit Class" value={sat.orbit} />
            <Stat label="Launch Date" value={new Date(sat.launchDate).toLocaleDateString()} />
            <Stat label="Latitude" value={`${sat.lat.toFixed(2)}°`} />
            <Stat label="Longitude" value={`${sat.lng.toFixed(2)}°`} />
            <Stat label="Operator" value={sat.operator} />
          </div>
        </div>

        <div className="mt-6 glass rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
            <Sparkles className="h-3.5 w-3.5" /> AI Insights — SkyLens
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold">About {sat.name}</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            {sat.name} is a {sat.type.toLowerCase()} spacecraft operated by {sat.operator}, currently in a {sat.orbit} orbit at {sat.altitudeKm.toLocaleString()} km altitude.
            Launched on {new Date(sat.launchDate).toDateString()}, it travels at {sat.velocityKms} km/s with an orbital inclination of {sat.inclination}°.
            Its mission contributes to ongoing research, communications, or observation programs, and it remains in {sat.status.toLowerCase()} status as of today.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { t: "Mission Importance", d: "Strategic asset for long-term space-based capabilities." },
              { t: "Orbit Profile", d: `${sat.orbit} regime · period ${Math.round(2 * Math.PI * Math.sqrt(Math.pow((6371 + sat.altitudeKm) * 1000, 3) / 3.986e14) / 60)} min` },
              { t: "Historical Note", d: "Part of a broader generation of spacecraft expanding global space access." },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="text-[10px] uppercase tracking-widest text-secondary">{x.t}</div>
                <div className="mt-1 text-sm">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-base font-semibold">{value}</div>
    </div>
  );
}
