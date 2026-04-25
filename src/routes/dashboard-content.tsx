import { Link } from "@tanstack/react-router";
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
import { useAuth } from "@/lib/auth";
import { getAllNotes, type Note } from "@/lib/notes";
import { cn } from "@/lib/utils";
import { bucketColor, groupByBucket } from "@/lib/buckets";
import { notifyError } from "@/lib/errors";

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

export function DashboardContent() {
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
        if (!user?.id) {
          setNotes([]);
          return;
        }
        const all = await getAllNotes(user.id);
        if (cancelled) return;
        setNotes(all);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.displayName || "Guest"}. Here's your memory overview.
          </p>
        </div>
        <Link to="/capture" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          <Mic className="h-4 w-4" />
          Capture new memory
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Total Memories</p>
          </div>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Today</p>
          </div>
          <p className="text-3xl font-bold mt-2">{stats.today}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">This Week</p>
          </div>
          <p className="text-3xl font-bold mt-2">{stats.week}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Unique Keywords</p>
          </div>
          <p className="text-3xl font-bold mt-2">{stats.uniqueKeywords}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Memory Activity (Last 30 Days)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                className="text-muted-foreground"
                fontSize={12}
              />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Memories & Keywords */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Memories */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Memories</h2>
          <div className="space-y-4">
            {notes.slice(0, 5).map((note) => (
              <div key={note.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                <div className={cn("w-3 h-3 rounded-full mt-1.5 shrink-0", bucketColor(note.bucket))} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{note.cleanedText}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{note.bucket}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{relativeTime(note.createdAt)}</span>
                  </div>
                  {note.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.keywords.slice(0, 3).map((keyword) => (
                        <span
                          key={keyword}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-8">
                <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No memories yet. Start capturing!</p>
                <Link
                  to="/capture"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  <Sparkles className="h-4 w-4" />
                  Capture your first memory
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Top Keywords */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Top Keywords</h2>
          <div className="space-y-3">
            {topKeywords.map(([keyword, count]) => (
              <div key={keyword} className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-sm font-medium">{keyword}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(count / maxKeyword) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
            {topKeywords.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No keywords yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bucket Overview */}
      {bucketGroups.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Memory Buckets</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bucketGroups.map(([bucket, notes]) => (
              <div key={bucket} className="flex items-center gap-3 p-4 rounded-md bg-muted/50">
                <div className={cn("w-4 h-4 rounded-full", bucketColor(bucket))} />
                <div>
                  <p className="font-medium">{bucket}</p>
                  <p className="text-sm text-muted-foreground">{notes.length} memories</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}