import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { getDb } from "./firebase";

export interface Note {
  id: string;
  originalTranscript: string;
  cleanedText: string;
  keywords: string[];
  createdAt: Date;
  userId?: string;
  bucket?: string;
  place?: string | null;
  lat?: number | null;
  lng?: number | null;
  city?: string | null;
}

const COLLECTION = "notes";

// In-memory cache of all notes — chat re-reads on every question, so caching
// trims a round-trip to Firestore.
let allNotesCache: { notes: Note[]; at: number } | null = null;
const ALL_NOTES_TTL = 30_000;

export function invalidateNotesCache(): void {
  allNotesCache = null;
}

export async function saveNote(input: {
  originalTranscript: string;
  cleanedText: string;
  keywords: string[];
  userId?: string;
  bucket?: string;
  place?: string | null;
  lat?: number | null;
  lng?: number | null;
  city?: string | null;
}): Promise<void> {
  await addDoc(collection(getDb(), COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  });
  invalidateNotesCache();
}

function mapDoc(id: string, data: Record<string, unknown>): Note {
  const ts = data.createdAt as Timestamp | undefined;
  return {
    id,
    originalTranscript: String(data.originalTranscript ?? ""),
    cleanedText: String(data.cleanedText ?? ""),
    keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
    createdAt: ts?.toDate?.() ?? new Date(),
    userId: typeof data.userId === "string" ? data.userId : undefined,
    bucket: typeof data.bucket === "string" ? data.bucket : "General",
    place: typeof data.place === "string" ? data.place : null,
    lat: typeof data.lat === "number" ? data.lat : null,
    lng: typeof data.lng === "number" ? data.lng : null,
    city: typeof data.city === "string" ? data.city : null,
  };
}

export async function getAllNotes(): Promise<Note[]> {
  if (allNotesCache && Date.now() - allNotesCache.at < ALL_NOTES_TTL) {
    return allNotesCache.notes;
  }
  const q = query(collection(getDb(), COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const notes = snap.docs.map((d) => mapDoc(d.id, d.data()));
  allNotesCache = { notes, at: Date.now() };
  return notes;
}

export async function getNotesLast24h(): Promise<Note[]> {
  const since = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const q = query(
    collection(getDb(), COLLECTION),
    where("createdAt", ">=", since),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data()));
}

export async function getNotesForDate(date: Date): Promise<Note[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const q = query(
    collection(getDb(), COLLECTION),
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<", Timestamp.fromDate(end)),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data()));
}

export async function getNotesForDateRange(start: Date, end: Date): Promise<Note[]> {
  const q = query(
    collection(getDb(), COLLECTION),
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<", Timestamp.fromDate(end)),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data()));
}