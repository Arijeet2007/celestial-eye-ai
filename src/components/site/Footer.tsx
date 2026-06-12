import { Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Rocket className="h-5 w-5 text-background" />
            </span>
            <span className="font-display text-sm font-bold tracking-wide">MISSION CONTROL AI</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            AI-powered space intelligence. Track satellites, monitor space weather, and explore the universe in real time.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/dashboard" className="hover:text-primary">Mission Control</Link></li>
            <li><Link to="/sky" className="hover:text-primary">Sky Above Me</Link></li>
            <li><Link to="/events" className="hover:text-primary">Event Center</Link></li>
            <li><Link to="/weather" className="hover:text-primary">Space Weather</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Data Sources</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>NASA APOD · NeoWs</li>
            <li>N2YO · CelesTrak</li>
            <li>NOAA Space Weather</li>
            <li>The Space Devs</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mission Status</h4>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Telemetry online</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> AI copilot ready</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-warning animate-pulse" /> Geomagnetic: G1</div>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 Mission Control AI — The Celestial Eye</span>
          <span className="font-mono">v1.0.0 · build 25544</span>
        </div>
      </div>
    </footer>
  );
}
