import { createFileRoute } from "@tanstack/react-router";
import { Mic, Sparkles, Network, MessageSquare } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — MemoryMesh" },
      { name: "description", content: "Speak, organize, connect, recall. Four steps from raw thought to retrievable memory." },
      { property: "og:title", content: "How it works — MemoryMesh" },
      { property: "og:description", content: "Speak, organize, connect, recall. Four steps from raw thought to retrievable memory." },
    ],
  }),
  component: HowPage,
});

const steps = [
  { n: "01", icon: Mic, title: "Speak it", body: "Hit the mic. Your stream-of-consciousness is transcribed live in your browser — privately, instantly." },
  { n: "02", icon: Sparkles, title: "AI organizes", body: "Gemini cleans the transcript, pulls keywords, infers a bucket, and tags location if shared." },
  { n: "03", icon: Network, title: "Connections form", body: "Each memory automatically links to related ones — by topic, time, keywords, or place." },
  { n: "04", icon: MessageSquare, title: "Recall on demand", body: "Ask the chat anything. Relevant memories surface with full context and citations." },
];

function HowPage() {
  return (
    <MarketingShell>
      <section className="bg-aurora">
        <div className="mx-auto w-full px-4 py-20 text-center sm:px-6 lg:px-10 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Workflow
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            From <span className="text-primary">raw thought</span> to memory
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Four simple steps. No manual organizing.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full px-4 py-20 sm:px-6 lg:px-10">
        <div className="relative space-y-12">
          <div className="absolute left-[27px] top-2 bottom-2 hidden w-px bg-border md:block" />
          {steps.map(({ n, icon: Icon, title, body }) => (
            <div key={n} className="relative flex gap-6">
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-ember)]">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 rounded-2xl border border-border/50 bg-card/40 p-6">
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Step {n}</div>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}