import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing Nepal — MemoryMesh" },
      { name: "description", content: "नेपाली users को लागि सरल NPR plans। Free बाट सुरु गर्नुहोस्, growth सँगै upgrade गर्नुहोस्।" },
      { property: "og:title", content: "Pricing Nepal — MemoryMesh" },
      { property: "og:description", content: "नेपाली users को लागि सरल NPR plans। Free बाट सुरु गर्नुहोस्, growth सँगै upgrade गर्नुहोस्।" },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Free",
    price: "रु 0",
    cadence: "/ सधैं",
    desc: "Start small, dream big.",
    cta: "Free मा सुरु गर्नुहोस्",
    features: ["प्रति महिना 100 voice memories", "AI cleanup + smart buckets", "Connection graph", "Daily Markdown export"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "रु 1,199",
    cadence: "/ महिना",
    desc: "Level up your second brain.",
    cta: "Pro मा जानुहोस्",
    features: ["Unlimited memories", "Long-form transcripts", "Priority AI processing", "Place + time recall", "Email support"],
    highlight: true,
  },
  {
    name: "Team",
    price: "रु 3,199",
    cadence: "/ seat / महिना",
    desc: "Think together, move faster.",
    cta: "Team plan लिनुहोस्",
    features: ["Everything in Pro", "Shared buckets", "Team graph view", "Admin controls", "SSO (coming soon)"],
    highlight: false,
  },
];

function PricingPage() {
  return (
    <MarketingShell>
      <section className="bg-aurora">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Nepal Pricing
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Nepal का लागि <span className="text-primary">smart pricing</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Free बाट सुरु गर्नुहोस्, growth आएपछि मात्र upgrade गर्नुहोस्.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative rounded-3xl border p-8 transition-all",
                p.highlight
                  ? "border-primary/50 bg-primary/10 shadow-[var(--shadow-ember)]"
                  : "border-border/50 bg-card/40 hover:border-border",
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary-foreground">
                  सबैभन्दा लोकप्रिय
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-tight">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.cadence}</span>
              </div>
              <Button
                asChild
                className={cn(
                  "mt-6 w-full rounded-full",
                  p.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-card text-foreground hover:bg-card/80",
                )}
              >
                <Link to="/signup">{p.cta}</Link>
              </Button>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}