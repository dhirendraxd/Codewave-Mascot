import { Boxes, Calendar, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { bucketColor, groupByBucket } from "@/lib/buckets";
import { getAllNotes, type Note } from "@/lib/notes";
import { notifyError } from "@/lib/errors";

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

export function BucketsContent() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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
        notifyError("firestore-read", err, () => setReloadKey((k) => k + 1));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, reloadKey]);

  const groups = useMemo(() => groupByBucket(notes), [notes]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Boxes className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Buckets</h1>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        Memories auto-grouped by topic. The AI invents the bucket as you talk.
      </p>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <p className="text-sm text-foreground">No buckets yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Capture memories — buckets will form automatically.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {groups.map((g) => {
            const c = bucketColor(g.name);
            return (
              <div
                key={g.name}
                className="flex w-72 shrink-0 flex-col rounded-2xl border bg-card"
                style={{ borderColor: c.border }}
              >
                <div
                  className="flex items-center justify-between rounded-t-2xl px-4 py-3"
                  style={{ backgroundColor: c.bg }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.dot }} />
                    <span className="text-sm font-semibold" style={{ color: c.text }}>
                      {g.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{g.notes.length}</span>
                </div>
                <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto p-3">
                  {g.notes.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-lg border border-border/60 bg-background p-3 transition-colors hover:border-primary/40"
                    >
                      <p className="line-clamp-3 text-sm text-foreground">{n.cleanedText}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {relativeTime(n.createdAt)}
                        </span>
                        {(n.place || n.city) && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {n.place || n.city}
                          </span>
                        )}
                      </div>
                      {n.keywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {n.keywords.slice(0, 4).map((k) => (
                            <span
                              key={k}
                              className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}