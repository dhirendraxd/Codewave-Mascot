import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Brain, Boxes, Network, MapPin, MessageSquare, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — MemoryMesh" },
      { name: "description", content: "Voice capture, AI buckets, semantic search, connection graph, and daily exports for your second brain." },
      { property: "og:title", content: "Features — MemoryMesh" },
      { property: "og:description", content: "Voice capture, AI buckets, semantic search, connection graph, and daily exports for your second brain." },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  { icon: Mic, title: "One-tap voice capture", desc: "Speak freely. The Web Speech API streams your transcript in real time — no upload, no friction." },
  { icon: Brain, title: "AI cleanup", desc: "Gemini polishes raw transcripts, extracts keywords, and infers a topical bucket without losing your voice." },
  { icon: Boxes, title: "Dynamic buckets", desc: "Topics emerge naturally — Business, Travel, Ideas — and reorganize as your thinking evolves." },
  { icon: Network, title: "Connection graph", desc: "Memories link across time, place, keywords, and bucket. See your mind think." },
  { icon: MessageSquare, title: "Conversational recall", desc: "Ask in plain English. The chat surfaces relevant memories with citations and context." },
  { icon: MapPin, title: "Location-aware", desc: "Optional geolocation tags every note with city — recall by where you were, not just when." },
  { icon: Sparkles, title: "Keyword cloud", desc: "See what your week was about. Themes weighted by frequency, not vanity metrics." },
  { icon: Download, title: "Daily dump export", desc: "One-click Markdown export of the last 24 hours. Your data, always portable." },
];

function FeaturesPage() {
  return (
    <MarketingShell>
      <section className="bg-aurora">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Features
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Everything you need to <span className="text-primary">never forget a thought</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            A focused toolkit that turns scattered voice notes into a searchable, connected second brain.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border border-border/50 bg-card/40 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/70">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-border">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Button asChild size="lg" className="rounded-full px-7">
            <Link to="/signup">Try it free</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}