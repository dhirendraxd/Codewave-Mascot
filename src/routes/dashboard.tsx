import { Link, createFileRoute } from "@tanstack/react-router";
import { Brain, Calendar, Hash, Loader2, Mic, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { LLMExportPanel } from "@/components/LLMExportPanel";
import { useAuth } from "@/lib/auth";
import { getAllNotes, type Note } from "@/lib/notes";
import { cn } from "@/lib/utils";
import { bucketColor, groupByBucket } from "@/lib/buckets";
import { notifyError } from "@/lib/errors";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MemoryMesh" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AuthGate>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </AuthGate>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function shortDay(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function DashboardContent() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const all = await getAllNotes();
        if (cancelled) return;
        const mine = all.filter((n) => !n.userId || n.userId === user?.id);
        setNotes(mine);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load notes");
        notifyError("firestore-read", err, () => setReloadKey((k) => k + 1));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, reloadKey]);

  const stats = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const today = notes.filter((n) => now - n.createdAt.getTime() < dayMs).length;
    const week = notes.filter((n) => now - n.createdAt.getTime() < 7 * dayMs).length;
    const allKeywords = notes.flatMap((n) => n.keywords);
    const uniqueKeywords = new Set(allKeywords.map((k) => k.toLowerCase()));
    return {
      total: notes.length,
      today,
      week,
      uniqueKeywords: uniqueKeywords.size,
    };
  }, [notes]);

  const chartData = useMemo(() => {
    const buckets = new Map<string, { date: string; label: string; count: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      buckets.set(key, { date: key, label: shortDay(d), count: 0 });
    }
    for (const n of notes) {
      const key = dayKey(n.createdAt);
      const bucket = buckets.get(key);
      if (bucket) bucket.count += 1;
    }
    return Array.from(buckets.values());
  }, [notes]);

  const topKeywords = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notes) {
      for (const k of n.keywords) {
        const norm = k.trim().toLowerCase();
        if (!norm) continue;
        counts.set(norm, (counts.get(norm) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [notes]);

  const maxKeyword = topKeywords[0]?.[1] ?? 1;
  const bucketGroups = useMemo(() => groupByBucket(notes).slice(0, 6), [notes]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back, {user?.displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's a snapshot of your second brain.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Brain} label="Total memories" value={stats.total} />
        <StatCard icon={Sparkles} label="Today" value={stats.today} accent />
        <StatCard icon={Calendar} label="This week" value={stats.week} />
        <StatCard icon={Hash} label="Unique keywords" value={stats.uniqueKeywords} />
      </div>

      {/* Bucket cards */}
      {bucketGroups.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Buckets</h2>
              <p className="text-xs text-muted-foreground">AI-discovered themes from your memories</p>
            </div>
            <Link
              to="/buckets"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {bucketGroups.map((g) => {
              const c = bucketColor(g.name);
              return (
                <Link
                  key={g.name}
                  to="/buckets"
                  className="group rounded-xl border p-3 transition-transform hover:-translate-y-0.5"
                  style={{ borderColor: c.border, backgroundColor: c.bg }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
                    <span className="truncate text-xs font-semibold" style={{ color: c.text }}>
                      {g.name}
                    </span>
                  </div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{g.notes.length}</div>
                  <div className="text-[10px] text-muted-foreground">memories</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* LLM export */}
      <div className="mt-6">
        <LLMExportPanel />
      </div>

      {/* Activity chart */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Activity</h2>
            <p className="text-xs text-muted-foreground">Memories captured over the last 30 days</p>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-4 h-56 w-full">
          {notes.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="emberFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: "var(--color-primary)", strokeWidth: 1, strokeOpacity: 0.4 }}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--color-foreground)",
                  }}
                  labelStyle={{ color: "var(--color-muted-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#emberFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Keyword cloud */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Top keywords</h2>
          <p className="text-xs text-muted-foreground">Themes from your memories</p>
          {topKeywords.length === 0 ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Keywords will appear once you capture memories.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {topKeywords.map(([word, count]) => {
                const scale = 0.85 + (count / maxKeyword) * 0.6;
                return (
                  <span
                    key={word}
                    style={{ fontSize: `${scale}rem` }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-medium text-primary"
                  >
                    {word}
                    <span className="text-[10px] text-primary/70">{count}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent list */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent memories</h2>
              <p className="text-xs text-muted-foreground">Your latest captured thoughts</p>
            </div>
            <Link
              to="/capture"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Mic className="h-3 w-3" /> Capture new
            </Link>
          </div>
          {notes.length === 0 ? (
            <div className="mt-8 flex flex-col items-center text-center">
              <Mic className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-foreground">No memories yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tap the mic and start talking to fill your second brain.
              </p>
              <Link
                to="/capture"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Capture your first memory
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {notes.slice(0, 8).map((n) => (
                <li key={n.id} className="py-3">
                  <p className="line-clamp-2 text-sm text-foreground">{n.cleanedText}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                    <span className="text-muted-foreground">{relativeTime(n.createdAt)}</span>
                    {n.keywords.slice(0, 4).map((k) => (
                      <span
                        key={k}
                        className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4",
        accent ? "border-primary/40 ember-glow" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", accent ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      Capture your first memory to see activity here.
    </div>
  );
}