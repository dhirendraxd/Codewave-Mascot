import { Boxes, Calendar, Loader2, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth";
import { bucketColor, groupByBucket } from "@/lib/buckets";
import { getAllNotes, type Note } from "@/lib/notes";
import { notifyError } from "@/lib/errors";

export const Route = createFileRoute("/buckets")({
  head: () => ({ meta: [{ title: "Buckets — MemoryMesh" }] }),
  component: BucketsPage,
});

function BucketsPage() {
  return (
    <AuthGate>
      <AppShell>
        <BucketsContent />
      </AppShell>
    </AuthGate>
  );
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

function BucketsContent() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Static demo notes for when there are no real notes
  const getDemoNotes = (): Note[] => [
    {
      id: "demo-1",
      originalTranscript: "Started my morning with meditation and planning the day ahead",
      cleanedText: "Started my morning with meditation and planning the day ahead.",
      keywords: ["meditation", "planning", "morning"],
      bucket: "Daily Routine",
      place: "Home",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "demo-2",
      originalTranscript: "Discussed the new project timeline and assigned tasks to team members",
      cleanedText: "Discussed the new project timeline and assigned tasks to team members.",
      keywords: ["meeting", "project", "timeline", "tasks"],
      bucket: "Work Projects",
      place: "Office",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      id: "demo-3",
      originalTranscript: "Completed a 30-minute workout focusing on cardio and strength training",
      cleanedText: "Completed a 30-minute workout focusing on cardio and strength training.",
      keywords: ["workout", "cardio", "strength", "fitness"],
      bucket: "Health & Fitness",
      place: "Gym",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      id: "demo-4",
      originalTranscript: "Finished reading the chapter about machine learning algorithms",
      cleanedText: "Finished reading the chapter about machine learning algorithms and took notes.",
      keywords: ["reading", "machine learning", "algorithms", "notes"],
      bucket: "Learning",
      place: "Home",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: "demo-5",
      originalTranscript: "Picked up groceries for the week including vegetables and fruits",
      cleanedText: "Picked up groceries for the week including vegetables, fruits, and dairy products.",
      keywords: ["groceries", "shopping", "food", "weekly"],
      bucket: "Personal Tasks",
      place: "Supermarket",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: "demo-6",
      originalTranscript: "Had a productive brainstorming session with the design team about the new app features",
      cleanedText: "Had a productive brainstorming session with the design team about the new app features.",
      keywords: ["brainstorming", "design", "app", "features", "team"],
      bucket: "Work Projects",
      place: "Conference Room",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: "demo-7",
      originalTranscript: "Practiced yoga and mindfulness exercises to reduce stress",
      cleanedText: "Practiced yoga and mindfulness exercises to reduce stress and improve mental clarity.",
      keywords: ["yoga", "mindfulness", "stress", "mental health"],
      bucket: "Health & Fitness",
      place: "Home",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      id: "demo-8",
      originalTranscript: "Attended an online webinar about modern web development trends",
      cleanedText: "Attended an online webinar about modern web development trends and took detailed notes.",
      keywords: ["webinar", "web development", "trends", "online learning"],
      bucket: "Learning",
      place: "Home Office",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: "demo-9",
      originalTranscript: "Organized my workspace and cleaned up digital files",
      cleanedText: "Organized my workspace and cleaned up digital files to improve productivity.",
      keywords: ["organization", "workspace", "productivity", "cleaning"],
      bucket: "Personal Tasks",
      place: "Home Office",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    },
    {
      id: "demo-10",
      originalTranscript: "Went for a relaxing walk in the park and enjoyed the fresh air",
      cleanedText: "Went for a relaxing walk in the park and enjoyed the fresh air and nature.",
      keywords: ["walk", "park", "relaxation", "nature", "fresh air"],
      bucket: "Health & Fitness",
      place: "Golden Gate Park",
      userId: user?.id || "guest",
      lat: null,
      lng: null,
      city: "San Francisco",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
  ];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const all = await getAllNotes();
        const userNotes = all.filter((n) => !n.userId || n.userId === user?.id);

        if (cancelled) return;

        // If no real notes, show demo notes
        if (userNotes.length === 0) {
          setNotes(getDemoNotes());
        } else {
          setNotes(userNotes);
        }
      } catch (err) {
        if (cancelled) return;
        // On error, show demo notes instead of failing
        setNotes(getDemoNotes());
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