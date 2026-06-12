import { createFileRoute } from "@tanstack/react-router";
import { Sun, Wind, Zap, Sparkles, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { spaceWeather } from "@/lib/mock-data";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Space Weather Center — Mission Control AI" },
      { name: "description", content: "Solar activity, geomagnetic storms, solar wind, and aurora forecasts." },
    ],
  }),
  component: Weather,
});

function Weather() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">NOAA · SWPC Monitoring</div>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Space Weather Center</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Real-time monitoring of solar activity, geomagnetic conditions, and aurora forecasts.
          </p>
        </div>

        {/* Status Strip */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Widget icon={Sun} label="Solar Flux (F10.7)" value={spaceWeather.solarFlux.toString()} sub="Moderate" tone="text-warning" />
          <Widget icon={Zap} label="Geomagnetic Kp" value={spaceWeather.kpIndex.toFixed(1)} sub="G1 — Minor Storm" tone="text-warning" />
          <Widget icon={Wind} label="Solar Wind" value={`${spaceWeather.solarWindKms} km/s`} sub="Elevated" tone="text-primary" />
          <Widget icon={Sparkles} label="Aurora" value="55°+" sub="Visible — Moderate" tone="text-success" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Chart title="Geomagnetic Kp — Last 36 hours" data={spaceWeather.kpHistory} max={9} color="primary" unit="" />
            <Chart title="Solar Wind Speed — Last 36 hours" data={spaceWeather.solarWindHistory} max={700} color="secondary" unit="km/s" />

            <div className="glass rounded-2xl p-5">
              <h3 className="font-display text-lg font-semibold">Geomagnetic Activity Heatmap</h3>
              <div className="mt-3 grid grid-cols-24 gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                {Array.from({ length: 24 * 4 }).map((_, i) => {
                  const intensity = Math.sin(i / 6) * 0.5 + 0.5;
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-sm"
                      style={{
                        background: `oklch(0.78 0.18 230 / ${0.1 + intensity * 0.6})`,
                      }}
                      title={`Hour ${i % 24}`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>00 UTC</span>
                <span>12 UTC</span>
                <span>23 UTC</span>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold">Active Alerts</h3>
              <div className="mt-3 space-y-2">
                {spaceWeather.alerts.map((a) => {
                  const Icon = a.level === "warning" ? AlertTriangle : a.level === "info" ? Info : CheckCircle2;
                  const color = a.level === "warning" ? "text-warning" : a.level === "info" ? "text-primary" : "text-success";
                  return (
                    <div key={a.id} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{a.title}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{a.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold">Aurora Forecast</h3>
              <p className="mt-2 text-sm text-muted-foreground">{spaceWeather.auroraForecast}</p>
              <div className="mt-4 h-32 rounded-lg bg-gradient-to-b from-success/40 via-accent/30 to-primary/40 ring-1 ring-border" />
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold">Impact Assessment</h3>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>● GPS accuracy: <span className="text-warning">Degraded</span></li>
                <li>● HF Radio: <span className="text-warning">Minor disruption</span></li>
                <li>● Power Grids: <span className="text-success">Nominal</span></li>
                <li>● Satellite Ops: <span className="text-success">Nominal</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Widget({ icon: Icon, label, value, sub, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; tone: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <div className={`mt-3 font-display text-3xl font-bold ${tone}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Chart({ title, data, max, color, unit }: { title: string; data: number[]; max: number; color: "primary" | "secondary"; unit: string }) {
  const w = 600;
  const h = 160;
  const stroke = color === "primary" ? "oklch(0.78 0.18 230)" : "oklch(0.84 0.16 210)";
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h * 0.9 - 8}`)
    .join(" ");
  const area = `M0,${h} L${points} L${w},${h} Z`;
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <div className="font-mono text-xs text-muted-foreground">
          current: <span className="text-foreground">{data[data.length - 1]}{unit && ` ${unit}`}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-40 w-full">
        <defs>
          <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1="0" y1={h * p} x2={w} y2={h * p} stroke="oklch(0.78 0.18 230 / 0.1)" strokeWidth="1" strokeDasharray="2 4" />
        ))}
        <path d={area} fill={`url(#g-${color})`} />
        <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" filter="drop-shadow(0 0 6px oklch(0.78 0.18 230 / 0.6))" />
      </svg>
    </div>
  );
}
