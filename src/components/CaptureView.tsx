import { Boxes, Check, Loader2, Lock, MapPin, Mic, MicOff, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { processNoteWithGemini, type ProcessedNote } from "@/lib/gemini";
import { saveNote } from "@/lib/notes";
import { useAuth } from "@/lib/auth";
import { tryCaptureGeolocation } from "@/lib/geo";
import { notifyError } from "@/lib/errors";

export function CaptureView() {
  const speech = useSpeechRecognition();
  const [processing, setProcessing] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null);
  const [savedDetails, setSavedDetails] = useState<
    | (ProcessedNote & { bucket: string; city: string | null; savedAt: Date })
    | null
  >(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const liveText = speech.finalTranscript + (speech.interimTranscript ? ` ${speech.interimTranscript}` : "");
  const hasText = liveText.trim().length > 0;

  const handleClick = async () => {
    if (processing) return;
    if (speech.listening) {
      speech.stop();
      const transcript = speech.finalTranscript.trim();
      if (!transcript) {
        speech.reset();
        return;
      }
      if (!user) {
        // Save the transcript so user can log in and save it after
        setPendingTranscript(transcript);
        try {
          window.sessionStorage.setItem("memorymesh:pending-transcript", transcript);
        } catch {
          // ignore
        }
        toast.message("Sign in to save this memory.", {
          description: "Your transcript is ready — log in or create an account to keep it.",
        });
        return;
      }
      await processAndSave(transcript);
    } else {
      speech.start();
    }
  };

  const processAndSave = async (transcript: string) => {
    setProcessing(true);
    let stage: "gemini" | "firestore-write" = "gemini";
    try {
      const [processed, geo] = await Promise.all([
        processNoteWithGemini(transcript),
        tryCaptureGeolocation(),
      ]);
      stage = "firestore-write";
      await saveNote({
        originalTranscript: transcript,
        cleanedText: processed.cleanedText,
        keywords: processed.keywords,
        bucket: processed.bucket,
        place: processed.place,
        userId: user?.id,
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        city: geo?.city ?? null,
      });
      toast.success(`Saved to ${processed.bucket}.`);
      setSavedDetails({ ...processed, city: geo?.city ?? null, savedAt: new Date() });
      setPendingTranscript(null);
      try { window.sessionStorage.removeItem("memorymesh:pending-transcript"); } catch { /* ignore */ }
      speech.reset();
    } catch (err) {
      // Keep transcript so retry has data; show pending UI as a fallback.
      setPendingTranscript(transcript);
      try {
        window.sessionStorage.setItem("memorymesh:pending-transcript", transcript);
      } catch {
        // ignore
      }
      notifyError(stage, err, () => {
        void processAndSave(transcript);
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!speech.supported) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <MicOff className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Voice capture unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your browser doesn't support the Web Speech API. Please use Chrome or Edge for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      {!user && (
        <div className="flex w-full max-w-2xl items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Lock className="h-4 w-4 text-primary" />
            <span>Try capture freely. <span className="text-muted-foreground">Sign in to save memories.</span></span>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={processing}
        aria-label={speech.listening ? "Stop recording" : "Start recording"}
        className={cn(
          "group relative flex h-44 w-44 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-52 sm:w-52",
          "bg-card text-foreground",
          speech.listening
            ? "border-primary animate-ember-pulse"
            : "border-primary/40 hover:border-primary hover:ember-glow",
          processing && "cursor-not-allowed opacity-70",
        )}
      >
        {processing ? (
          <Loader2 className="!h-12 !w-12 animate-spin text-primary" />
        ) : (
          <Mic
            className={cn(
              "!h-16 !w-16 transition-colors",
              speech.listening ? "text-primary" : "text-foreground/80 group-hover:text-primary",
            )}
          />
        )}
      </button>

      <div className="min-h-24 w-full max-w-2xl text-center">
        {savedDetails ? (
          <SavedNoteDetails details={savedDetails} onDismiss={() => setSavedDetails(null)} />
        ) : pendingTranscript ? (
          <div className="rounded-xl border border-border bg-card/60 p-5 text-left">
            <p className="text-sm text-muted-foreground">Captured transcript</p>
            <p className="mt-2 text-base leading-relaxed text-foreground">{pendingTranscript}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => navigate({ to: "/signup" })} className="rounded-full">
                Create account to save
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: "/login" })} className="rounded-full">
                Log in
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setPendingTranscript(null);
                  speech.reset();
                  try { window.sessionStorage.removeItem("memorymesh:pending-transcript"); } catch { /* ignore */ }
                }}
                className="rounded-full"
              >
                Discard
              </Button>
            </div>
          </div>
        ) : processing ? (
          <p className="text-sm tracking-wide text-muted-foreground">Processing thought…</p>
        ) : hasText ? (
          <p className="text-xl leading-relaxed text-foreground sm:text-2xl">
            <span>{speech.finalTranscript}</span>
            {speech.interimTranscript && (
              <span className="text-muted-foreground"> {speech.interimTranscript}</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {speech.listening ? "Listening…" : "Tap the mic and start talking."}
          </p>
        )}
        {speech.error && !processing && (
          <p className="mt-3 text-xs text-destructive">Error: {speech.error}</p>
        )}
      </div>
    </div>
  );
}

function SavedNoteDetails({
  details,
  onDismiss,
}: {
  details: ProcessedNote & { city: string | null; savedAt: Date };
  onDismiss: () => void;
}) {
  const time = details.savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="animate-fade-in-up rounded-2xl border border-primary/30 bg-card/70 p-5 text-left shadow-[var(--shadow-ember)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Memory Saved</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {time} · processed by Gemini
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Cleaned text */}
      <div className="mt-4 rounded-xl border border-border bg-background/60 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cleaned text</p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">{details.cleanedText}</p>
      </div>

      {/* Meta row: bucket + place */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <Boxes className="h-3 w-3" />
          {details.bucket}
        </span>
        {details.place && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
            <MapPin className="h-3 w-3 text-primary" />
            {details.place}
            {details.city && details.city !== details.place && (
              <span className="text-muted-foreground">· {details.city}</span>
            )}
          </span>
        )}
        {!details.place && details.city && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
            <MapPin className="h-3 w-3 text-primary" />
            {details.city}
          </span>
        )}
      </div>

      {/* Keywords */}
      {details.keywords.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Keywords
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {details.keywords.map((k) => (
              <span
                key={k}
                className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-foreground"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}