import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight, Brain, Mic, Network, TrendingUp, Boxes, Sparkles, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { OrbitHero } from "@/components/marketing/OrbitHero";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MemoryMesh — capture thoughts, connect the dots" },
      { name: "description", content: "Capture ideas by voice, link them automatically, and recall what changed over time." },
      { property: "og:title", content: "MemoryMesh — capture thoughts, connect the dots" },
      { property: "og:description", content: "Capture ideas by voice, link them automatically, and recall what changed over time." },
    ],
  }),
  component: Home,
});

const highlights = [
  {
    icon: Mic,
    title: "Speak first",
    body: "Capture a thought in seconds. No folders, no setup, no drag.",
  },
  {
    icon: Network,
    title: "See the links",
    body: "Related notes connect automatically across time, place, and topic.",
  },
  {
    icon: TrendingUp,
    title: "Catch the shift",
    body: "Track reinforcement, expansion, and contradiction as your thinking changes.",
  },
];

const signals = [
  { label: "Capture", detail: "Voice or text in one tap" },
  { label: "Connect", detail: "Auto tags, buckets, and links" },
  { label: "Recall", detail: "Ask questions and get context" },
];

function Home() {
  const { user } = useAuth();
  return (
    <MarketingShell>
      <section className="relative overflow-hidden bg-aurora">
        <div className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,oklch(1_0_0/0.06)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-28">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border border-border/60 bg-card/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <Brain className="h-3 w-3 text-primary" />
              Voice-first memory
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[64px]">
              Capture thoughts. <span className="text-primary">Connect the dots.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
              MemoryMesh turns quick voice notes into a clean, linked memory system that shows what changed and why.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-none px-7">
                <Link to="/capture">
                  Start capturing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-none px-7">
                <Link to="/features">See features</Link>
              </Button>
              {!user && (
                <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Already have an account? Log in
                </Link>
              )}
            </div>
          </div>

          <div className="relative">
            <OrbitHero />
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border border-border/60 bg-card/40 p-6">
                <div className="flex h-10 w-10 items-center justify-center border border-border/60 bg-background">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">What it does</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Enough structure to remember. Not enough to slow you down.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">
              Capture a thought, let the app organize it, and come back later with a question instead of a folder hunt.
            </p>
          </div>
          <div className="space-y-3">
            {signals.map((signal) => (
              <div key={signal.label} className="flex items-center justify-between border border-ink-soft bg-background px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{signal.label}</div>
                  <div className="text-xs text-ink-muted">{signal.detail}</div>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-primary">Ready</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 border border-border/60 bg-card/40 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ready for production</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">A clean public page that loads fast and says less.</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Tight copy, fewer sections, and a clearer path into the app.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-none px-7">
              <Link to="/signup">
                Try it free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
