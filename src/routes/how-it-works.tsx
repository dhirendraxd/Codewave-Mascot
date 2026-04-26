import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Sparkles, Network, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — MemoryMesh" },
      { name: "description", content: "Speak, organize, connect, recall. Four short steps from raw thought to useful memory." },
      { property: "og:title", content: "How it works — MemoryMesh" },
      { property: "og:description", content: "Speak, organize, connect, recall. Four short steps from raw thought to useful memory." },
    ],
  }),
  component: HowPage,
});

const steps = [
  { n: "01", icon: Mic, title: "Speak it", body: "Tap the mic and capture the thought before it disappears." },
  { n: "02", icon: Sparkles, title: "Shape it", body: "The app cleans the note, tags it, and groups it automatically." },
  { n: "03", icon: Network, title: "Link it", body: "Related memories connect across time, place, and topic." },
  { n: "04", icon: MessageSquare, title: "Recall it", body: "Ask a question and get the matching memory, not a pile of notes." },
];

function HowPage() {
  return (
    <MarketingShell>
      <section className="bg-aurora">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <span className="inline-flex items-center gap-2 border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Workflow
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            From <span className="text-primary">raw thought</span> to retrievable memory
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Four quiet steps. No tags to manage, no folders to maintain.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative space-y-12">
          <div className="absolute left-[27px] top-2 bottom-2 hidden w-px bg-border md:block" />
          {steps.map(({ n, icon: Icon, title, body }) => (
            <div key={n} className="relative flex gap-6">
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center border border-border bg-primary text-primary-foreground shadow-[var(--shadow-ember)]">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 border border-border/50 bg-card/40 p-6">
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Step {n}</div>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Button asChild size="lg" className="rounded-none px-7">
            <Link to="/signup">Start capturing</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}