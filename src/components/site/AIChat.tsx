import { useState } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SAMPLE_RESPONSES: Record<string, string> = {
  iss: "🛰️ The ISS is currently 408 km above Earth, traveling at 7.66 km/s. Your next visible pass is tonight at 21:14 local time — a 6-minute pass reaching 67° elevation in the SE sky. It will appear as a steady, bright, fast-moving star.",
  meteor: "☄️ The Geminids peak on December 14, producing up to 150 meteors/hour. They radiate from the Gemini constellation and are best viewed after midnight from a dark site. The Quadrantids in early January are next on the calendar.",
  visible: "🌌 Tonight from your location: Jupiter blazes at magnitude -2.4 in the southeast, Saturn follows at +0.6, the ISS passes overhead at 21:14, and the Orion Nebula climbs into view by midnight. Best viewing window: 22:00–01:00 with 78% clear skies.",
  hubble: "🔭 The Hubble Space Telescope launched April 24, 1990 aboard STS-31. Orbiting at 538 km, it has captured 1.6 million observations across UV, visible, and near-IR. Servicing missions kept it operational well past its design life — it remains active alongside JWST.",
};

function generateReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("iss") || p.includes("station")) return SAMPLE_RESPONSES.iss;
  if (p.includes("meteor") || p.includes("shower")) return SAMPLE_RESPONSES.meteor;
  if (p.includes("visible") || p.includes("tonight") || p.includes("delhi")) return SAMPLE_RESPONSES.visible;
  if (p.includes("hubble")) return SAMPLE_RESPONSES.hubble;
  return `✨ I'm SkyLens — your AI astronomy copilot. I can explain satellites, predict celestial events, analyze space weather, and recommend the best targets for tonight's sky. What would you like to explore?`;
}

const SUGGESTIONS = [
  "What's visible above me tonight?",
  "When is the ISS passing overhead?",
  "Explain the Hubble Space Telescope",
  "What meteor showers are coming this month?",
];

export function AIChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Welcome to SkyLens AI. Ask me about satellites, celestial events, or the universe." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", content: generateReply(text) }]);
      setThinking(false);
    }, 700);
  };

  return (
    <div className={`flex flex-col glass rounded-2xl overflow-hidden ${compact ? "h-[460px]" : "h-[640px]"}`}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-primary">
          <Sparkles className="h-4 w-4 text-background" />
        </span>
        <div>
          <div className="text-sm font-semibold">SkyLens AI</div>
          <div className="text-[10px] uppercase tracking-widest text-success">● Online</div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/20 text-primary">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-br from-primary to-secondary text-background"
                  : "bg-muted/60 text-foreground"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent/30 text-accent-foreground">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            SkyLens is analyzing the cosmos…
          </div>
        )}
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask SkyLens anything about the cosmos…"
          className="flex-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-background"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
