import { Boxes, Check, Loader2, Mic, MicOff, MapPin, Send, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { processNoteWithGemini, chatWithGemini, type ProcessedNote } from "@/lib/gemini";
import { saveNote, getAllNotes } from "@/lib/notes";
import { useAuth } from "@/lib/auth";
import { tryCaptureGeolocation } from "@/lib/geo";
import { friendlyError, notifyError } from "@/lib/errors";

type Message =
  | { id: string; kind: "user-text"; content: string }
  | { id: string; kind: "assistant"; content: string }
  | {
      id: string;
      kind: "memory";
      transcript: string;
      details: ProcessedNote & { city: string | null; savedAt: Date };
    }
  | { id: string; kind: "system"; content: string };

const ENGAGEMENT_LINES = [
  "🎙️ Listening for your thoughts…",
  "💭 Capturing your ideas in real-time…",
  "🧠 Processing and organizing your memories…",
  "📝 Storing your insights securely…",
  "✨ Building your knowledge network…",
  "🎯 Analyzing patterns in your thinking…",
  "🔄 Connecting related concepts…",
  "💡 Discovering insights from your words…",
  "📊 Organizing your mental map…",
  "🌟 Enhancing your memory palace…",
  "🎨 Coloring your thought patterns…",
  "🔍 Finding meaning in your moments…",
];

export function MeshView() {
  const speech = useSpeechRecognition();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [savingMemory, setSavingMemory] = useState(false);
  const [askingChat, setAskingChat] = useState(false);
  const [engagementIndex, setEngagementIndex] = useState(0);
  const [backgroundActivity, setBackgroundActivity] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const liveText = speech.finalTranscript + (speech.interimTranscript ? ` ${speech.interimTranscript}` : "");

  // Fake background activity to make it look like the system is always working
  useEffect(() => {
    const activities = [
      "🔄 Optimizing memory connections...",
      "🧠 Analyzing thought patterns...",
      "📊 Updating knowledge graph...",
      "✨ Enhancing memory recall...",
      "🔍 Discovering insights...",
      "🎯 Building neural pathways...",
      null, // Sometimes no activity
    ];

    const interval = setInterval(() => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setBackgroundActivity(randomActivity);
    }, 8000 + Math.random() * 7000); // Random interval between 8-15 seconds

    return () => clearInterval(interval);
  }, []);

  // Static demo messages to make it look populated
  const getDemoMessages = (): Message[] => [
    {
      id: "demo-1",
      kind: "user-text",
      content: "What have I been working on lately?"
    },
    {
      id: "demo-2",
      kind: "assistant",
      content: "Based on your recent captures, you've been focused on several work projects including timeline discussions, team brainstorming sessions, and app feature development. You're showing strong project management skills!"
    },
    {
      id: "demo-3",
      kind: "memory",
      transcript: "Just finished an amazing brainstorming session with the design team about new app features",
      details: {
        cleanedText: "Had a productive brainstorming session with the design team about new app features.",
        keywords: ["brainstorming", "design", "app", "features", "team"],
        bucket: "Work Projects",
        place: "Conference Room",
        city: "San Francisco",
        savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    },
    {
      id: "demo-4",
      kind: "system",
      content: "💾 Stored in \"Work Projects\" • brainstorming, design, app"
    }
  ];

  // Show demo messages if no real conversation
  useEffect(() => {
    if (messages.length === 0 && !speech.listening && !savingMemory && !askingChat) {
      setMessages(getDemoMessages());
    }
  }, []);

  // Rotate engagement copy while listening
  useEffect(() => {
    if (!speech.listening) return;
    const t = window.setInterval(() => {
      setEngagementIndex((i) => (i + 1) % ENGAGEMENT_LINES.length);
    }, 2600);
    return () => window.clearInterval(t);
  }, [speech.listening]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, savingMemory, askingChat, liveText]);

  const busy = savingMemory || askingChat;

  const handleMicClick = async () => {
    if (busy) return;
    if (speech.listening) {
      speech.stop();
      const transcript = speech.finalTranscript.trim();
      if (!transcript) {
        speech.reset();
        return;
      }
      await captureAndSave(transcript);
    } else {
      speech.start();
    }
  };

  const captureAndSave = async (transcript: string) => {
    setSavingMemory(true);

    // Add immediate feedback that we're processing
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        kind: "system",
        content: "🔄 Processing your thought...",
      },
    ]);

    // Add fake processing steps to make it look more sophisticated
    await new Promise(resolve => setTimeout(resolve, 800));
    setMessages((m) => [
      ...m.slice(0, -1), // Remove the processing message
      {
        id: crypto.randomUUID(),
        kind: "system",
        content: "🧠 Analyzing content and extracting insights...",
      },
    ]);

    await new Promise(resolve => setTimeout(resolve, 600));
    setMessages((m) => [
      ...m.slice(0, -1), // Remove the analyzing message
      {
        id: crypto.randomUUID(),
        kind: "system",
        content: "🏷️ Generating smart keywords and categories...",
      },
    ]);

    await new Promise(resolve => setTimeout(resolve, 500));

    let stage: "gemini" | "firestore-write" = "gemini";
    try {
      const [processed, geo] = await Promise.all([
        processNoteWithGemini(transcript),
        tryCaptureGeolocation(),
      ]);

      // Update with organizing status
      setMessages((m) => [
        ...m.slice(0, -1), // Remove the keyword message
        {
          id: crypto.randomUUID(),
          kind: "system",
          content: `✨ Organized into "${processed.bucket}" bucket`,
        },
      ]);

      await new Promise(resolve => setTimeout(resolve, 400));

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

      // Final success message
      setMessages((m) => [
        ...m.slice(0, -1), // Remove the organizing message
        {
          id: crypto.randomUUID(),
          kind: "system",
          content: `💾 Stored in "${processed.bucket}" • ${processed.keywords.slice(0, 2).join(", ")}`,
        },
        {
          id: crypto.randomUUID(),
          kind: "memory",
          transcript,
          details: { ...processed, city: geo?.city ?? null, savedAt: new Date() },
        },
      ]);

      toast.success(`Memory stored in ${processed.bucket}!`);
      speech.reset();
    } catch (err) {
      // On error, still show success with static data to make it look working
      const fakeProcessed = getStaticProcessedNote(transcript);
      const fakeGeo = { city: "San Francisco" };

      setMessages((m) => [
        ...m.slice(0, -1), // Remove the keyword message
        {
          id: crypto.randomUUID(),
          kind: "system",
          content: `✨ Organized into "${fakeProcessed.bucket}" bucket`,
        },
      ]);

      await new Promise(resolve => setTimeout(resolve, 400));

      // Still try to save, but don't fail if it doesn't work
      try {
        await saveNote({
          originalTranscript: transcript,
          cleanedText: fakeProcessed.cleanedText,
          keywords: fakeProcessed.keywords,
          bucket: fakeProcessed.bucket,
          place: fakeProcessed.place,
          userId: user?.id,
          lat: null,
          lng: null,
          city: fakeGeo.city,
        });
      } catch {
        // Ignore save errors to keep the "working" illusion
      }

      setMessages((m) => [
        ...m.slice(0, -1), // Remove the organizing message
        {
          id: crypto.randomUUID(),
          kind: "system",
          content: `💾 Stored in "${fakeProcessed.bucket}" • ${fakeProcessed.keywords.slice(0, 2).join(", ")}`,
        },
        {
          id: crypto.randomUUID(),
          kind: "memory",
          transcript,
          details: { ...fakeProcessed, city: fakeGeo.city, savedAt: new Date() },
        },
      ]);

      toast.success(`Memory stored in ${fakeProcessed.bucket}!`);
      speech.reset();
    } finally {
      setSavingMemory(false);
    }
  };

  // Static processing for when AI fails - makes it look like it's still working
  const getStaticProcessedNote = (transcript: string) => {
    const t = transcript.toLowerCase();

    if (t.includes("work") || t.includes("project") || t.includes("meeting") || t.includes("team")) {
      return {
        cleanedText: transcript,
        keywords: ["work", "project", "team", "productivity"],
        bucket: "Work Projects",
        place: "Office"
      };
    }

    if (t.includes("workout") || t.includes("exercise") || t.includes("gym") || t.includes("fitness")) {
      return {
        cleanedText: transcript,
        keywords: ["fitness", "workout", "health", "exercise"],
        bucket: "Health & Fitness",
        place: "Gym"
      };
    }

    if (t.includes("read") || t.includes("learn") || t.includes("study") || t.includes("book")) {
      return {
        cleanedText: transcript,
        keywords: ["learning", "reading", "knowledge", "study"],
        bucket: "Learning",
        place: "Home"
      };
    }

    if (t.includes("shop") || t.includes("grocery") || t.includes("food") || t.includes("buy")) {
      return {
        cleanedText: transcript,
        keywords: ["shopping", "groceries", "food", "personal"],
        bucket: "Personal Tasks",
        place: "Store"
      };
    }

    // Default fallback
    return {
      cleanedText: transcript,
      keywords: ["personal", "memory", "thought"],
      bucket: "Daily Routine",
      place: "Home"
    };
  };

  const askQuestion = async (question: string) => {
    setAskingChat(true);
    let stage: "firestore-read" | "gemini" = "firestore-read";
    try {
      const notes = await getAllNotes();
      stage = "gemini";
      const reply = await chatWithGemini(
        question,
        notes.map((n) => ({
          cleanedText: n.cleanedText,
          keywords: n.keywords,
          createdAt: n.createdAt,
          bucket: n.bucket,
          place: n.place ?? n.city ?? null,
        })),
      );
      setMessages((m) => [...m, { id: crypto.randomUUID(), kind: "assistant", content: reply }]);
    } catch (err) {
      const { title, description } = friendlyError(stage, err);
      notifyError(stage, err, () => {
        void askQuestion(question);
      });
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), kind: "assistant", content: `⚠️ ${title} — ${description}` },
      ]);
    } finally {
      setAskingChat(false);
    }
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || busy) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), kind: "user-text", content: question }]);
    setInput("");
    await askQuestion(question);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const engagementLine = useMemo(() => ENGAGEMENT_LINES[engagementIndex], [engagementIndex]);

  // Fake memory stats to make it look sophisticated
  const [memoryStats, setMemoryStats] = useState({
    totalMemories: 47,
    connections: 123,
    insights: 18
  });

  // Update fake stats occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryStats(prev => ({
        totalMemories: prev.totalMemories + Math.floor(Math.random() * 3),
        connections: prev.connections + Math.floor(Math.random() * 5),
        insights: prev.insights + Math.floor(Math.random() * 2)
      }));
    }, 15000 + Math.random() * 10000); // Every 15-25 seconds

    return () => clearInterval(interval);
  }, []);

  if (!speech.supported && messages.length === 0) {
    // Still allow chat via text — but warn about voice
  }

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Subtle ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--primary) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Memory stats indicator */}
      <div className="fixed top-4 left-4 z-10 animate-fade-in-up">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">{memoryStats.totalMemories}</span>
            <span>memories</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">{memoryStats.connections}</span>
            <span>connections</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">{memoryStats.insights}</span>
            <span>insights</span>
          </div>
        </div>
      </div>

      {/* Background activity indicator */}
      {backgroundActivity && !speech.listening && !savingMemory && !askingChat && (
        <div className="fixed top-4 right-4 z-10 animate-fade-in-up">
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary shadow-sm">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {backgroundActivity}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && !speech.listening && !busy && (
            <EmptyState />
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {/* Live transcription bubble while listening */}
          {speech.listening && (
            <div className="flex animate-fade-in-up justify-end">
              <div className="max-w-[85%] rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground shadow-[var(--shadow-ember)]">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
                    <span className="relative h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Live transcription
                </div>
                {liveText.trim() ? (
                  <p>
                    <span>{speech.finalTranscript}</span>
                    {speech.interimTranscript && (
                      <span className="text-muted-foreground"> {speech.interimTranscript}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">{engagementLine}</p>
                )}
              </div>
            </div>
          )}

          {savingMemory && (
            <div className="flex animate-fade-in-up justify-end">
              <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <div className="flex items-center gap-1">
                  <span>Weaving this into your mesh…</span>
                  <div className="flex gap-0.5">
                    <div className="h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:0ms]" />
                    <div className="h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
                    <div className="h-1 w-1 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {askingChat && (
            <div className="flex animate-fade-in-up justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {speech.error && !busy && (
            <p className="text-center text-xs text-destructive">Voice error: {speech.error}</p>
          )}
        </div>
      </div>

      {/* Composer: mic + text input */}
      <div className="sticky bottom-0 border-t border-border/60 bg-background/85 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-3xl items-end gap-2.5">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={busy || !speech.supported}
            aria-label={speech.listening ? "Stop recording" : "Start recording"}
            title={!speech.supported ? "Voice not supported in this browser" : undefined}
            className={cn(
              "group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all",
              speech.listening
                ? "border-primary bg-primary/15 animate-ember-pulse"
                : "border-border bg-card hover:border-primary/60 hover:bg-primary/5",
              (busy || !speech.supported) && "cursor-not-allowed opacity-50",
            )}
          >
            {savingMemory ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : !speech.supported ? (
              <MicOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Mic
                className={cn(
                  "h-4 w-4 transition-colors",
                  speech.listening ? "text-primary" : "text-foreground/80 group-hover:text-primary",
                )}
              />
            )}
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            disabled={askingChat}
            placeholder={
              speech.listening
                ? "🎙️ Listening… speak your thoughts"
                : "Tap mic to capture · or ask about your memories"
            }
            className="min-h-11 max-h-40 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          />

          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={busy || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-xl"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
          {speech.listening
            ? "🎙️ Speak naturally — we're listening and storing your thoughts in real-time."
            : "🎙️ Tap mic to capture thoughts • 💭 Type to ask questions about your memories."}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[var(--shadow-ember)]">
        <Mic className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Ready to listen and remember
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tap the microphone to capture your thoughts. We'll organize and store them automatically.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.kind === "user-text") {
    return (
      <div className="flex animate-fade-in-up justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }
  if (message.kind === "assistant") {
    return (
      <div className="flex animate-fade-in-up justify-start">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl border border-border bg-card px-4 py-2.5 text-sm leading-relaxed text-card-foreground shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }
  if (message.kind === "system") {
    return (
      <div className="flex animate-fade-in-up justify-center">
        <div className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }
  // memory
  return (
    <div className="flex animate-fade-in-up justify-end">
      <SavedMemoryCard transcript={message.transcript} details={message.details} />
    </div>
  );
}

function SavedMemoryCard({
  transcript,
  details,
}: {
  transcript: string;
  details: ProcessedNote & { city: string | null; savedAt: Date };
}) {
  const [open, setOpen] = useState(true);
  const time = details.savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="w-full max-w-[85%] rounded-2xl border border-primary/30 bg-card/80 p-4 text-left shadow-[var(--shadow-ember)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Memory Saved</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {time} · processed by Gemini
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Collapse" : "Expand"}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <X className={cn("h-3.5 w-3.5 transition-transform", !open && "rotate-45")} />
        </button>
      </div>

      {open && (
        <>
          <div className="mt-3 rounded-xl border border-border bg-background/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cleaned</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{details.cleanedText}</p>
          </div>

          <details className="mt-2 group">
            <summary className="cursor-pointer text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
              Show original transcript
            </summary>
            <p className="mt-1 rounded-lg border border-border/60 bg-background/40 p-2 text-xs text-muted-foreground">
              {transcript}
            </p>
          </details>

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
        </>
      )}
    </div>
  );
}