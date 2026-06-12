import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { AIChat } from "@/components/site/AIChat";
import { Brain, Telescope, Satellite, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "SkyLens AI — Mission Control AI" },
      { name: "description", content: "Conversational astronomy copilot. Ask about satellites, events, and the universe." },
    ],
  }),
  component: AIPage,
});

function AIPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs uppercase tracking-widest text-accent">
            <Sparkles className="h-3 w-3" /> Powered by SkyLens AI
          </div>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-6xl">
            Your <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">astronomy copilot</span> for the cosmos.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Ask anything about satellites, celestial events, missions, and what's visible above you tonight.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <AIChat />

          <aside className="space-y-4">
            <Capability icon={Telescope} title="Sky Awareness" desc="What's visible tonight, when to look, and where in the sky." />
            <Capability icon={Satellite} title="Satellite Intelligence" desc="Mission profiles, orbits, operators, and live telemetry." />
            <Capability icon={Brain} title="Event Reasoning" desc="Predict meteor showers, eclipses, ISS passes for any location." />

            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Try asking</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>"What is visible above Delhi tonight?"</li>
                <li>"When is the ISS passing overhead?"</li>
                <li>"Explain the Hubble Space Telescope."</li>
                <li>"What meteor showers are coming this month?"</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Capability({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-display text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
