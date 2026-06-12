import { Link, useRouterState } from "@tanstack/react-router";
import { Rocket, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/sky", label: "Sky Above Me" },
  { to: "/events", label: "Events" },
  { to: "/weather", label: "Space Weather" },
  { to: "/ai", label: "SkyLens AI" },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_oklch(0.78_0.18_230/0.6)]">
              <Rocket className="h-5 w-5 text-background" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold tracking-wide">MISSION CONTROL</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">The Celestial Eye</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const active = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative rounded-md px-3 py-2 text-sm transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-background shadow-[0_0_20px_oklch(0.78_0.18_230/0.5)] transition-transform hover:scale-[1.02] sm:inline-flex"
            >
              Launch Mission Control
            </Link>
            <button
              className="grid h-10 w-10 place-items-center rounded-lg border border-border lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border lg:hidden">
            <div className="mx-auto max-w-7xl px-4 py-3">
              <div className="grid gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
