import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Brain, Boxes, Network, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — MemoryMesh" },
      { name: "description", content: "Voice capture, auto-organization, linked memories, and fast recall in one focused app." },
      { property: "og:title", content: "Features — MemoryMesh" },
      { property: "og:description", content: "Voice capture, auto-organization, linked memories, and fast recall in one focused app." },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  { icon: Mic, title: "Voice capture", desc: "Speak once and move on. Notes land fast, without setup." },
  { icon: Brain, title: "AI cleanup", desc: "Gemini polishes the transcript and keeps the meaning intact." },
  { icon: Boxes, title: "Auto buckets", desc: "Thoughts are grouped into simple buckets as they arrive." },
  { icon: Network, title: "Connection graph", desc: "See related memories cluster across time and context." },
  { icon: MessageSquare, title: "Recall by asking", desc: "Search with plain language and get the relevant thread back." },
  { icon: MapPin, title: "Place-aware", desc: "Optional location tags make memories easier to revisit later." },
];

function FeaturesPage() {
  return (
    <MarketingShell>
      <section className="bg-aurora">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Features
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Everything you need to <span className="text-primary">capture and recall fast</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            A focused toolkit for turning quick voice notes into a clean, connected memory flow.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group border border-border/50 bg-card/40 p-6 transition-all hover:border-[#7A3A30] hover:bg-card/70">
              <div className="flex h-11 w-11 items-center justify-center border border-border/60 bg-background">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Button asChild size="lg" className="rounded-none px-7">
            <Link to="/signup">Try it free</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}