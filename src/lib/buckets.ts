import type { Note } from "./notes";

export interface BucketGroup {
  name: string;
  notes: Note[];
}

export function groupByBucket(notes: Note[]): BucketGroup[] {
  const map = new Map<string, Note[]>();
  for (const n of notes) {
    const key = (n.bucket && n.bucket.trim()) || "General";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }
  return Array.from(map.entries())
    .map(([name, ns]) => ({
      name,
      notes: ns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    }))
    .sort((a, b) => b.notes.length - a.notes.length);
}

export function bucketColor(name: string): {
  bg: string;
  border: string;
  text: string;
  dot: string;
} {
  return {
    bg: "color-mix(in oklab, var(--color-card) 88%, var(--color-primary) 12%)",
    border:
      "color-mix(in oklab, var(--color-border) 75%, var(--color-primary) 25%)",
    text: "var(--color-foreground)",
    dot: "var(--color-primary)",
  };
}
