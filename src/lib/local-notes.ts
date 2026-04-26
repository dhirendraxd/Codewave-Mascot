import type { Note } from "./notes";

const LOCAL_NOTES_KEY = "memorymesh_guest_notes";

export interface LocalNote extends Omit<Note, 'createdAt'> {
  createdAt: string; // Store as ISO string for localStorage
}

export function saveNoteLocally(note: Omit<Note, 'id' | 'createdAt'> & { createdAt?: Date }): string {
  const notes = getLocalNotes();
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const localNote: LocalNote = {
    ...note,
    id,
    createdAt: (note.createdAt || new Date()).toISOString(),
  };

  notes.push(localNote);
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
  return id;
}

export function getLocalNotes(): LocalNote[] {
  try {
    const stored = localStorage.getItem(LOCAL_NOTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getLocalNotesAsNotes(): Note[] {
  return getLocalNotes().map(localNote => ({
    ...localNote,
    createdAt: new Date(localNote.createdAt),
  }));
}

export function clearLocalNotes(): void {
  localStorage.removeItem(LOCAL_NOTES_KEY);
}

export async function syncGuestDataToFirebase(guestUserId: string, firebaseUserId: string): Promise<void> {
  const localNotes = getLocalNotes();

  if (localNotes.length === 0) {
    clearLocalNotes();
    return;
  }

  // Import the Firebase save function dynamically to avoid circular imports
  const { saveNote } = await import("./notes");

  // Sync each local note to Firebase
  for (const localNote of localNotes) {
    try {
      await saveNote({
        originalTranscript: localNote.originalTranscript,
        cleanedText: localNote.cleanedText,
        keywords: localNote.keywords,
        userId: firebaseUserId,
        bucket: localNote.bucket,
        place: localNote.place,
        lat: localNote.lat,
        lng: localNote.lng,
        city: localNote.city,
      });
    } catch (error) {
      console.error("Failed to sync note:", localNote.id, error);
      // Continue with other notes even if one fails
    }
  }

  // Clear local notes after successful sync
  clearLocalNotes();
}