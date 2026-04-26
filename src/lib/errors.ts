// Friendly error messages + toast helpers for Gemini & Firestore failures.
import { toast } from "sonner";

export type ErrorKind = "gemini" | "firestore-read" | "firestore-write" | "unknown";

function rawMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "";
}

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * Translate a raw error into a short, human-friendly message based on what
 * the user was trying to do. Falls back to a generic message if unknown.
 */
export function friendlyError(kind: ErrorKind, err: unknown): { title: string; description: string } {
  const raw = rawMessage(err);
  const lower = raw.toLowerCase();

  if (isOffline()) {
    return {
      title: "You're offline",
      description: "Check your internet connection and try again.",
    };
  }

  if (kind === "gemini") {
    if (lower.includes("api key") || lower.includes("api_key") || raw.includes("403")) {
      return {
        title: "AI service is not configured",
        description: "The Gemini API key is missing or invalid. Please add it in src/lib/gemini.ts.",
      };
    }
    if (raw.includes("429") || lower.includes("quota") || lower.includes("rate")) {
      return {
        title: "AI is rate-limited",
        description: "Too many requests right now. Wait a moment and retry.",
      };
    }
    if (raw.includes("500") || raw.includes("503") || lower.includes("unavailable")) {
      return {
        title: "AI service is unavailable",
        description: "Gemini is temporarily down. Please try again shortly.",
      };
    }
    if (lower.includes("no text")) {
      return {
        title: "AI returned no response",
        description: "Try rephrasing or recording again.",
      };
    }
    return {
      title: "Couldn't process with AI",
      description: raw || "Something went wrong while talking to Gemini.",
    };
  }

  if (kind === "firestore-read") {
    if (lower.includes("permission")) {
      return {
        title: "Can't load your memories",
        description: "Permission denied. Please sign in again.",
      };
    }
    if (lower.includes("unavailable") || lower.includes("network")) {
      return {
        title: "Couldn't reach the database",
        description: "Network issue while loading. Retry in a moment.",
      };
    }
    return {
      title: "Couldn't load your memories",
      description: raw || "Something went wrong fetching your data.",
    };
  }

  if (kind === "firestore-write") {
    if (lower.includes("permission")) {
      return {
        title: "Can't save this memory",
        description: "Permission denied. Please sign in again.",
      };
    }
    if (lower.includes("unavailable") || lower.includes("network")) {
      return {
        title: "Couldn't save — connection issue",
        description: "We'll keep your transcript ready. Tap retry when you're back online.",
      };
    }
    return {
      title: "Couldn't save this memory",
      description: raw || "Something went wrong while saving.",
    };
  }

  return {
    title: "Something went wrong",
    description: raw || "Please try again.",
  };
}

/** Show an error toast with an optional Retry action. */
export function notifyError(
  kind: ErrorKind,
  err: unknown,
  onRetry?: () => void,
): void {
  const { title, description } = friendlyError(kind, err);
  toast.error(title, {
    description,
    duration: 8000,
    action: onRetry ? { label: "Retry", onClick: onRetry } : undefined,
  });
}