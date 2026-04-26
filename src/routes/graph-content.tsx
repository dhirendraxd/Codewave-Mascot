import { Loader2, Network } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { bucketColor } from "@/lib/buckets";
import { getAllNotes, type Note } from "@/lib/notes";
import { notifyError } from "@/lib/errors";

interface GraphNode {
  id: string;
  note: Note;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface GraphEdge {
  source: string;
  target: string;
  strength: number; // 1..3
  reason: string;
}

function buildEdges(notes: Note[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const sixHoursMs = 6 * 60 * 60 * 1000;
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const a = notes[i];
      const b = notes[j];
      const reasons: string[] = [];
      let strength = 0;
      if (a.bucket && b.bucket && a.bucket === b.bucket) {
        strength += 2;
        reasons.push(`bucket: ${a.bucket}`);
      }
      const aKw = new Set(a.keywords.map((k) => k.toLowerCase()));
      const sharedKw = b.keywords.filter((k) => aKw.has(k.toLowerCase()));
      if (sharedKw.length > 0) {
        strength += sharedKw.length;
        reasons.push(`shared: ${sharedKw.slice(0, 3).join(", ")}`);
      }
      const dt = Math.abs(a.createdAt.getTime() - b.createdAt.getTime());
      if (dt < sixHoursMs) {
        strength += 1;
        reasons.push("close in time");
      }
      const placeA = a.place || a.city;
      const placeB = b.place || b.city;
      if (placeA && placeB && placeA === placeB) {
        strength += 1;
        reasons.push(`same place: ${placeA}`);
      }
      if (strength >= 2) {
        edges.push({
          source: a.id,
          target: b.id,
          strength,
          reason: reasons.join(" • "),
        });
      }
    }
  }
  return edges;
}

function useForceLayout(
  notes: Note[],
  edges: GraphEdge[],
  width: number,
  height: number,
) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);

  useEffect(() => {
    const cx = width / 2;
    const cy = height / 2;
    const initial: GraphNode[] = notes.map((n, i) => {
      const angle = (i / Math.max(1, notes.length)) * Math.PI * 2;
      const r = Math.min(width, height) * 0.3;
      return {
        id: n.id,
        note: n,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: 0,
        vy: 0,
      };
    });

    // Simple force-directed: repulsion + edge attraction + center gravity
    const iterations = 250;
    const repulsion = 4500;
    const springLen = 90;
    const springK = 0.04;
    const gravity = 0.015;
    const damping = 0.85;

    const byId = new Map(initial.map((n) => [n.id, n]));

    for (let it = 0; it < iterations; it++) {
      // repulsion
      for (let i = 0; i < initial.length; i++) {
        for (let j = i + 1; j < initial.length; j++) {
          const a = initial[i];
          const b = initial[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy + 0.01;
          const force = repulsion / dist2;
          const dist = Math.sqrt(dist2);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }
      // edges (springs)
      for (const e of edges) {
        const a = byId.get(e.source);
        const b = byId.get(e.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const diff = dist - springLen;
        const f = springK * diff * Math.min(3, e.strength);
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
      // gravity + integrate
      for (const n of initial) {
        n.vx += (cx - n.x) * gravity;
        n.vy += (cy - n.y) * gravity;
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
        // bounds
        n.x = Math.max(30, Math.min(width - 30, n.x));
        n.y = Math.max(30, Math.min(height - 30, n.y));
      }
    }

    setNodes(initial);
  }, [notes, edges, width, height]);

  return nodes;
}

export function GraphContent() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () =>
      setSize({ w: el.clientWidth, h: Math.max(500, el.clientHeight) });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const edges = useMemo(() => buildEdges(notes), [notes]);
  const nodes = useForceLayout(notes, edges, size.w, size.h);
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const hoveredNode = hovered ? nodeMap.get(hovered) : null;
  const hoveredEdges = hovered
    ? edges.filter((e) => e.source === hovered || e.target === hovered)
    : [];

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
      <div className="mb-2 flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Connections
        </h1>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Memories connected by shared bucket, keywords, time, and place.
      </p>

      {notes.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <p className="text-sm text-foreground">
            Need at least 2 memories to draw a graph.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Capture a few more thoughts.
          </p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-card/40"
          style={{ minHeight: 560 }}
        >
          <svg width={size.w} height={size.h} className="block">
            {edges.map((e, i) => {
              const a = nodeMap.get(e.source);
              const b = nodeMap.get(e.target);
              if (!a || !b) return null;
              const isHi =
                hovered && (e.source === hovered || e.target === hovered);
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={isHi ? "var(--color-primary)" : "var(--color-border)"}
                  strokeOpacity={isHi ? 0.9 : 0.35}
                  strokeWidth={isHi ? 2 : 1}
                />
              );
            })}
            {nodes.map((n) => {
              const c = bucketColor(n.note.bucket || "General");
              const r =
                8 +
                Math.min(
                  8,
                  edges.filter((e) => e.source === n.id || e.target === n.id)
                    .length,
                );
              const isHi = hovered === n.id;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() =>
                    setHovered((h) => (h === n.id ? null : h))
                  }
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    r={r}
                    fill={c.dot}
                    stroke={
                      isHi
                        ? "var(--color-foreground)"
                        : "var(--color-background)"
                    }
                    strokeWidth={isHi ? 2 : 1.5}
                  />
                </g>
              );
            })}
          </svg>

          {hoveredNode && (
            <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-xl border border-border bg-background/95 p-3 shadow-xl backdrop-blur">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: bucketColor(
                      hoveredNode.note.bucket || "General",
                    ).dot,
                  }}
                />
                <span className="text-xs font-semibold text-foreground">
                  {hoveredNode.note.bucket || "General"}
                </span>
              </div>
              <p className="text-sm text-foreground">
                {hoveredNode.note.cleanedText}
              </p>
              <div className="mt-2 text-[11px] text-muted-foreground">
                {hoveredNode.note.createdAt.toLocaleString()}
                {(hoveredNode.note.place || hoveredNode.note.city) &&
                  ` • ${hoveredNode.note.place || hoveredNode.note.city}`}
              </div>
              {hoveredEdges.length > 0 && (
                <div className="mt-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                  <div className="mb-1 font-medium text-foreground">
                    Connected to {hoveredEdges.length}
                  </div>
                  {hoveredEdges.slice(0, 3).map((e, i) => (
                    <div key={i} className="truncate">
                      • {e.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-border bg-background/80 px-2.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
            {nodes.length} nodes • {edges.length} connections
          </div>
        </div>
      )}
    </div>
  );
}
