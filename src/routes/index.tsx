import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight, Check, Quote, Star, Mic, MessageSquare, Boxes, Network,
  Sparkles, Brain, TrendingUp, GitBranch, AlertCircle, Search, MapPin, Download,
  Mic2, Lightbulb, GraduationCap, Rocket, Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { OrbitHero } from "@/components/marketing/OrbitHero";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MemoryMesh — A living map of how your thinking evolves" },
      { name: "description", content: "Voice-first AI that captures thoughts, connects them, and reveals how your thinking changes over time — reinforcement, expansion, and contradiction." },
      { property: "og:title", content: "MemoryMesh — A living map of how your thinking evolves" },
      { property: "og:description", content: "Voice-first AI that captures thoughts, connects them, and reveals how your thinking changes over time." },
    ],
  }),
  component: Home,
});

const logos = ["Notion", "Linear", "Raycast", "Arc", "Vercel"];

// 5-stage pipeline from the project outline
const steps = [
  { n: 1, title: "Capture", body: "Speak (or type) any idea. Voice is transcribed instantly — no friction, no formatting." },
  { n: 2, title: "Understand", body: "AI generates a concise summary, extracts topics and tags, and builds a semantic embedding." },
  { n: 3, title: "Connect", body: "Each new thought is compared to your past entries. Related ideas are linked automatically." },
  { n: 4, title: "Evolve", body: "The Thinking Evolution Engine detects similarity, progression, and contradiction across time." },
  { n: 5, title: "Recall", body: "Ask in natural language. Get structured summaries, linked notes, and evolution insights." },
];

// Product capabilities — every item maps to a feature already shipping in the app
const productFeatures = [
  { icon: Mic, title: "One-tap Voice Capture", body: "Tap, talk, done. The Web Speech API streams your transcript live — no upload, no friction." },
  { icon: Brain, title: "AI Cleanup (Gemini)", body: "Gemini polishes the raw transcript, fixes grammar, and keeps your voice intact." },
  { icon: Sparkles, title: "Auto Keywords", body: "Three relevant keywords are extracted from every note — no manual tagging." },
  { icon: Boxes, title: "Dynamic Buckets", body: "A concise bucket name is inferred per note (e.g. \"Marketing Project\", \"Morning Routine\")." },
  { icon: MapPin, title: "Place-aware", body: "Optional geolocation tags each note with city + an inferred place label like \"Office\" or \"Gym\"." },
  { icon: Network, title: "Connection Graph", body: "See how memories link across time, place, keywords, and bucket." },
  { icon: MessageSquare, title: "Conversational Recall", body: "Ask in plain English. The chat surfaces relevant memories with citations." },
  { icon: TrendingUp, title: "Evolution Engine", body: "Detects reinforcement, expansion, and contradiction across your timeline." },
  { icon: Download, title: "Daily Dump Export", body: "One-click Markdown export of the last 24 hours — or any chosen day, in your timezone." },
];

// Thinking Evolution Engine — the core innovation
const evolutionTypes = [
  {
    icon: GitBranch,
    label: "Reinforcement",
    color: "oklch(0.74 0.15 145)", // green
    body: "Repeated or consistent beliefs that show up across days and contexts.",
  },
  {
    icon: TrendingUp,
    label: "Expansion",
    color: "oklch(0.72 0.13 235)", // blue
    body: "Ideas gaining depth, nuance, or new perspectives over time.",
  },
  {
    icon: AlertCircle,
    label: "Contradiction",
    color: "oklch(0.68 0.18 25)", // red
    body: "Clear shifts or reversals — moments your thinking changed direction.",
  },
];

const useCases = [
  { icon: Mic2, title: "Creators", body: "Track how an idea develops across episodes, drafts, and posts. Stop repeating yourself." },
  { icon: GraduationCap, title: "Students", body: "Watch a concept deepen as you study. See where your understanding actually shifted." },
  { icon: Rocket, title: "Founders", body: "Revisit early assumptions. Spot when your strategy quietly changed — before it costs you." },
  { icon: Sprout, title: "Personal growth", body: "Reflect on beliefs and mindset. Build self-awareness through your own words." },
];

function Home() {
  const { user } = useAuth();
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-aurora lg:h-[100svh] lg:min-h-[700px]">
        <div className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,oklch(1_0_0/0.06)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-28 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-6 lg:pt-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <Brain className="h-3 w-3 text-primary" />
              Voice-first · Thinking Evolution Engine
            </div>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[56px] xl:text-[64px]">
              A living map of how your{" "}
              <span className="text-primary">thinking evolves.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground">
              MemoryMesh captures your thoughts by voice, connects them across time, and reveals
              how your ideas reinforce, expand, or contradict — turning scattered notes into self-awareness.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/capture">
                  Speak your first thought
                  <ArrowRight className="h-4 w-4" />
                </Link>
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

        {/* Logo strip */}
        <div className="border-t border-border/60 bg-background/40 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-x-10 gap-y-4 px-4 py-6 sm:px-6 lg:px-8">
            {logos.map((l) => (
              <span key={l} className="text-sm font-semibold tracking-wide text-muted-foreground/70">
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM → SOLUTION */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">— The Problem</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                You don't just lose ideas. <br />You lose the growth of your thinking.
              </h2>
              <ul className="mt-8 space-y-4 text-sm leading-relaxed text-ink-muted">
                <li className="flex gap-3"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />Most ideas are never captured in the first place.</li>
                <li className="flex gap-3"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />Captured ideas sit in isolation — no thread between them.</li>
                <li className="flex gap-3"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />There's no visibility into how your thinking actually changes over time.</li>
              </ul>
              <p className="mt-6 max-w-md text-sm text-ink-muted">
                Tools like Notion AI and Obsidian focus on storage and organization — not the evolution of thought.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">— The Solution</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                A system that helps you <span className="italic">understand</span> how your ideas change.
              </h2>
              <ul className="mt-8 space-y-4 text-sm leading-relaxed text-ink-muted">
                <li className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />Capture instantly via voice (or text) — zero friction.</li>
                <li className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />Auto-structure and tag thoughts with semantic understanding.</li>
                <li className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />Connect related ideas across days, weeks, and months.</li>
                <li className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />Detect shifts, contradictions, and patterns in your own mind.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS — How it works */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">— Process</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">From spoken thought to insight</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-muted">
              Five stages. One pipeline. Your messy stream of consciousness becomes a connected, queryable map.
            </p>
          </div>

          <div className="relative mt-16 grid gap-10 md:grid-cols-3 lg:grid-cols-5">
            {steps.map((s) => (
              <div key={s.n} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-cream text-lg font-semibold text-ink">
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-ink-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THINKING EVOLUTION ENGINE — Core Innovation */}
      <section className="bg-cream-soft">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">— Core Innovation</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                The Thinking <br />Evolution Engine
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
                MemoryMesh doesn't just link your notes — it watches how your ideas change.
                Three signals, surfaced across your timeline:
              </p>

              <div className="mt-8 space-y-4">
                {evolutionTypes.map(({ icon: Icon, label, color, body }) => (
                  <div
                    key={label}
                    className="flex gap-4 rounded-2xl border p-4"
                    style={{
                      borderColor: `color-mix(in oklab, ${color} 30%, var(--color-border))`,
                      background: `color-mix(in oklab, ${color} 6%, var(--color-card))`,
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-ink" style={{ color }}>{label}</h3>
                      <p className="mt-1 text-sm text-ink-muted">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day 1 → Day 10 example */}
            <div className="rounded-2xl border border-ink-soft bg-card p-6 shadow-xl sm:p-8">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Example — your timeline
              </div>

              <div className="mt-5 space-y-5">
                <div className="rounded-xl border border-ink-soft bg-background p-4">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-muted">
                    <span>Day 1</span>
                    <span className="text-primary">Voice note</span>
                  </div>
                  <p className="mt-2 text-sm text-foreground">"AI will replace creative jobs."</p>
                </div>

                <div className="ml-4 flex items-center gap-2 text-[11px] text-ink-muted">
                  <div className="h-px w-8 bg-ink/20" />
                  <span>9 days later…</span>
                </div>

                <div className="rounded-xl border border-ink-soft bg-background p-4">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-muted">
                    <span>Day 10</span>
                    <span className="text-primary">Voice note</span>
                  </div>
                  <p className="mt-2 text-sm text-foreground">"AI will assist creators."</p>
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "color-mix(in oklab, oklch(0.68 0.18 25) 35%, var(--color-border))",
                    background: "color-mix(in oklab, oklch(0.68 0.18 25) 8%, var(--color-card))",
                  }}
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider" style={{ color: "oklch(0.68 0.18 25)" }}>
                    <AlertCircle className="h-3 w-3" />
                    Contradiction detected
                  </div>
                  <p className="mt-2 text-sm text-foreground">
                    "Your thinking has shifted from <span className="font-semibold">replacement</span> → <span className="font-semibold">assistance</span>."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THOUSANDS OF BENEFITS — alt showcase */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">— Recall</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Ask your past self <br />a question.
            </h2>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed text-ink-muted">
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                "What have I been thinking about AI lately?"
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                "How has my opinion on hiring changed this quarter?"
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                "Show me the evolution of my product strategy."
              </li>
            </ul>
            <p className="mt-6 max-w-md text-sm text-ink-muted">
              Get back structured summaries, the connected notes that informed them, and an evolution insight — not just a list of search results.
            </p>
            <Button asChild className="mt-8 rounded-full px-7">
              <Link to="/features">Read More</Link>
            </Button>
          </div>

          {/* Mock preview cards */}
          <div className="relative">
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 overflow-hidden rounded-2xl border border-ink-soft bg-card p-5 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 ring-1 ring-primary/30" />
                  <div>
                    <div className="text-[10px] text-ink-muted">Recall query</div>
                    <div className="text-xs font-semibold text-ink">"Thinking on AI"</div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-background p-4 text-foreground">
                  <div className="text-[10px] uppercase tracking-wider opacity-70">Linked thoughts</div>
                  <div className="mt-1 text-2xl font-semibold">14 notes</div>
                  <div className="mt-1 text-[10px] opacity-70">spanning 23 days · 2 shifts detected</div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[Mic, MessageSquare, Boxes, Sparkles].map((Icon, i) => (
                    <div key={i} className="flex aspect-square items-center justify-center rounded-xl bg-cream-soft">
                      <Icon className="h-4 w-4 text-ink" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Evolution</div>
                <div className="mt-2 space-y-2">
                  {[
                    { t: "Reinforcement — \"AI as collaborator\"", v: "×4" },
                    { t: "Contradiction — replacement → assist", v: "Day 1 → 10" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-ink-soft bg-background p-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/15 ring-1 ring-primary/20" />
                        <span className="text-[11px] font-medium text-ink">{r.t}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-ink">{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 overflow-hidden rounded-2xl border border-ink-soft bg-card p-4 shadow-xl">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Active topics</div>
                <div className="mt-3 space-y-2">
                  {[
                    { n: "AI & creativity" },
                    { n: "Hiring" },
                    { n: "Product strategy" },
                  ].map((b) => (
                    <div key={b.n} className="rounded-xl border border-border bg-background p-3 text-foreground">
                      <div className="text-[10px] opacity-80">Topic</div>
                      <div className="text-sm font-semibold">{b.n}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Thinking trend</div>
                <svg viewBox="0 0 100 40" className="mt-2 h-12 w-full">
                  <path d="M0 30 Q 20 10 40 22 T 80 14 T 100 20" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY — stats + checkmark grid */}
      <section className="bg-cream-soft">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Not another <br />note-taking app.
              </h2>
              <p className="mt-4 max-w-md text-sm text-ink-muted">
                MemoryMesh stores ideas the way other tools do — but the difference is what happens next: connection, comparison, and a clear view of how you're changing.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 self-end">
              {[
                { v: "5", l: "Pipeline stages" },
                { v: "3", l: "Evolution signals" },
                { v: "0", l: "Manual tagging" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-3xl font-semibold text-ink sm:text-4xl">{s.v}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-ink-muted">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {productFeatures.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink">
                  <Check className="h-4 w-4 text-ink" strokeWidth={3} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-ink" />
                    <h3 className="text-base font-semibold text-ink">{title}</h3>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">— Use Cases</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Built for thinkers who change</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-muted">
              Anyone whose ideas evolve over time gets value from seeing that evolution clearly.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-ink-soft bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEST FEATURE — device showcase */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">— Best Feature</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Your second brain, in your pocket
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-muted">
            Tap the mic, talk for ten seconds, and let MemoryMesh handle the summarization, connection, and evolution tracking.
          </p>

          <div className="mt-14 overflow-hidden rounded-2xl border border-ink-soft bg-card p-8 text-left shadow-xl sm:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-ink-soft px-3 py-1 text-[10px] uppercase tracking-wider text-ink-muted">
                  <Brain className="h-3 w-3" /> Voice-first capture
                </div>
                <h3 className="mt-5 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                  Speak it. We'll <span className="italic">connect</span> it.
                </h3>
                <p className="mt-4 max-w-md text-sm text-ink-muted">
                  No formatting, no tagging, no folders. Just talk — MemoryMesh structures the thought and threads it into the rest of your thinking.
                </p>
                <div className="mt-6 flex max-w-sm items-center gap-2 rounded-full border border-ink-soft bg-cream-soft p-1.5">
                  <span className="ml-3 flex-1 truncate text-xs text-ink-muted">Enter your email address</span>
                  <Button asChild size="sm" className="rounded-full">
                    <Link to="/capture">Try free</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="mx-auto aspect-[4/5] w-full max-w-[320px] rounded-[2rem] border border-ink-soft bg-background p-4 shadow-2xl">
                  <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[2rem] bg-background p-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-[var(--shadow-ember)] animate-ember-pulse">
                      <Mic className="h-8 w-8 text-background" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Listening</div>
                      <div className="mt-1 text-sm text-foreground">"Maybe AI is more of a collaborator than a replacement…"</div>
                    </div>
                    <div className="flex w-full justify-around pt-2">
                      {[Sparkles, Network, Lightbulb].map((Icon, i) => (
                        <div key={i} className="flex h-9 w-9 items-center justify-center rounded-xl bg-card">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING STRIP */}
      <section className="bg-cream-soft">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">— Pricing</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Choose your plan</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ink-muted">
            Start free. Upgrade only when your second brain outgrows the basics.
          </p>

          <div className="mt-14 grid gap-6 text-left lg:grid-cols-3">
            {[
              {
                name: "Basic", price: "$0", cadence: "/month", desc: "Free account",
                features: ["100 memories / mo", "AI cleanup", "Manual buckets", "Markdown export"],
                highlight: false,
              },
              {
                name: "Standard", price: "$9", cadence: "/month", desc: "All free + features",
                features: ["Unlimited memories", "Auto buckets", "Connection graph", "Place + time recall", "Priority AI"],
                highlight: true,
              },
              {
                name: "Premium", price: "$24", cadence: "/seat / mo", desc: "All Pro features",
                features: ["Shared buckets", "Team graph", "Admin controls", "SSO (soon)"],
                highlight: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={
                  p.highlight
                    ? "rounded-2xl border border-primary/40 bg-primary/10 p-8 text-foreground shadow-2xl"
                    : "rounded-2xl border border-ink-soft bg-background p-8 text-foreground"
                }
              >
                <div className={p.highlight ? "text-xs uppercase tracking-wider opacity-70" : "text-xs uppercase tracking-wider text-ink-muted"}>
                  {p.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold">{p.price}</span>
                  <span className={p.highlight ? "text-xs opacity-70" : "text-xs text-ink-muted"}>{p.cadence}</span>
                </div>
                <div className={p.highlight ? "mt-1 text-xs opacity-70" : "mt-1 text-xs text-ink-muted"}>{p.desc}</div>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={
                    p.highlight
                      ? "mt-8 w-full rounded-full"
                      : "mt-8 w-full rounded-full"
                  }
                >
                  <Link to="/signup">Open Account</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL BAND */}
      <section className="bg-cream-soft">
        <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-ink-soft bg-background p-10 sm:p-14">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div className="relative aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-border bg-card">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-[var(--shadow-ember)]">
                    <Quote className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">— Testimonials</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  What our users say
                </h3>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted">
                  "I knew my thinking on hiring had shifted, but MemoryMesh actually showed me when and why. That's something no other tool has ever done for me."
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-ink">Devon K.</div>
                    <div className="text-xs text-ink-muted">Founder, Indie Studio</div>
                    <div className="mt-1 flex items-center gap-0.5 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                      <span className="ml-1 text-[11px] text-ink-muted">4.9</span>
                    </div>
                  </div>
                  <Button asChild size="icon" className="h-10 w-10 rounded-full">
                    <Link to="/signup"><ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
