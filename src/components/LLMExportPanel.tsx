import { format } from "date-fns";
import { CalendarIcon, ClipboardCheck, Copy, Download, FileText, Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { getNotesForDateRange, type Note } from "@/lib/notes";
import { notifyError } from "@/lib/errors";
import { cn } from "@/lib/utils";

const DEFAULT_QUESTION =
  "Summarise the dominant themes across these memories, highlight any contradictions or shifts in my thinking, and suggest 3 questions I should ask myself next.";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function fmtFile(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatNoteForPrompt(n: Note, idx: number): string {
  const time = n.createdAt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const tags = n.keywords.length ? n.keywords.join(", ") : "—";
  const bucket = n.bucket || "General";
  const place = n.place || n.city || null;
  return [
    `[${idx + 1}] ${time} · ${bucket}${place ? ` · ${place}` : ""}`,
    n.cleanedText.trim(),
    `Tags: ${tags}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPrompt(opts: {
  notes: Note[];
  question: string;
  from: Date;
  to: Date;
  displayName: string;
}): string {
  const { notes, question, from, to, displayName } = opts;
  const q = question.trim() || DEFAULT_QUESTION;

  const intro = [
    `You are helping ${displayName} reflect on their personal voice-captured memories.`,
    `The notes below were recorded between ${format(from, "PPP")} and ${format(to, "PPP")} (${notes.length} ${notes.length === 1 ? "memory" : "memories"} total).`,
    `Each entry is already cleaned and tagged. Treat them as the ONLY source of truth — do not invent facts beyond them.`,
  ].join(" ");

  const body = notes.length
    ? notes.map((n, i) => formatNoteForPrompt(n, i)).join("\n\n")
    : "(No memories were captured in this date range.)";

  return [
    intro,
    "",
    "=== MEMORIES ===",
    body,
    "=== END MEMORIES ===",
    "",
    `My request: ${q}`,
  ].join("\n");
}

export function LLMExportPanel() {
  const { user } = useAuth();
  const today = useMemo(() => startOfDay(new Date()), []);
  const weekAgo = useMemo(() => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() - 6);
    return d;
  }, []);

  const [from, setFrom] = useState<Date>(weekAgo);
  const [to, setTo] = useState<Date>(today);
  const [question, setQuestion] = useState<string>(DEFAULT_QUESTION);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const rangeValid = from.getTime() <= to.getTime();

  const handleGenerate = async () => {
    if (!rangeValid) {
      toast.error("End date must be on or after start date.");
      return;
    }
    setGenerating(true);
    setPrompt(null);
    try {
      const start = startOfDay(from);
      const end = endOfDay(to);
      const all = await getNotesForDateRange(start, end);
      const mine = all.filter((n) => !n.userId || n.userId === user?.id);
      const built = buildPrompt({
        notes: mine,
        question,
        from: start,
        to: end,
        displayName: user?.displayName ?? "MemoryMesh user",
      });
      setPrompt(built);
      setCount(mine.length);
      if (mine.length === 0) {
        toast.message("No memories in that range — prompt is empty.");
      } else {
        toast.success(`Final prompt ready — ${mine.length} memories baked in.`);
      }
    } catch (err) {
      notifyError("firestore-read", err, () => void handleGenerate());
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success("Copied — paste straight into ChatGPT, Claude, or Gemini.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      toast.error("Couldn't copy", {
        description: err instanceof Error ? err.message : "Clipboard blocked.",
      });
    }
  };

  const handleDownload = (ext: "txt" | "md") => {
    if (!prompt) return;
    const mime = ext === "md" ? "text/markdown" : "text/plain";
    const blob = new Blob([prompt], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MemoryMesh_LLMPrompt_${fmtFile(from)}_to_${fmtFile(to)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded .${ext}`);
  };

  const setQuickRange = (days: number) => {
    const end = startOfDay(new Date());
    const start = startOfDay(new Date());
    start.setDate(start.getDate() - (days - 1));
    setFrom(start);
    setTo(end);
  };

  const charCount = prompt?.length ?? 0;
  const approxTokens = Math.ceil(charCount / 4);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Export as LLM-ready prompt</h2>
            <p className="text-xs text-muted-foreground">
              Pick a date range, type what you want to ask, and we'll build one self-contained prompt — ready to paste into any LLM.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <QuickChip label="Today" onClick={() => setQuickRange(1)} />
          <QuickChip label="7 days" onClick={() => setQuickRange(7)} />
          <QuickChip label="30 days" onClick={() => setQuickRange(30)} />
          <QuickChip label="90 days" onClick={() => setQuickRange(90)} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DateField label="From" value={from} onChange={setFrom} max={to} />
        <DateField label="To" value={to} onChange={setTo} min={from} max={today} />
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          What do you want the LLM to do with these memories?
        </label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder={DEFAULT_QUESTION}
          className="resize-none text-sm"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={handleGenerate} disabled={generating || !rangeValid} size="sm">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {generating ? "Building…" : "Build final prompt"}
        </Button>
        {prompt && (
          <>
            <Button onClick={handleCopy} variant="secondary" size="sm">
              {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={() => handleDownload("txt")} variant="ghost" size="sm">
              <Download className="h-4 w-4" />
              .txt
            </Button>
            <Button onClick={() => handleDownload("md")} variant="ghost" size="sm">
              <Download className="h-4 w-4" />
              .md
            </Button>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {count} memories · {charCount.toLocaleString()} chars · ~{approxTokens.toLocaleString()} tokens
            </span>
          </>
        )}
      </div>

      {prompt && (
        <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-border/60 bg-background/60 p-3">
          <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-muted-foreground">
            {prompt}
          </pre>
        </div>
      )}
    </div>
  );
}

function QuickChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
    >
      {label}
    </button>
  );
}

function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  min?: Date;
  max?: Date;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal text-sm")}
          >
            <CalendarIcon className="h-4 w-4 opacity-60" />
            {format(value, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => d && onChange(d)}
            disabled={(date) => {
              if (min && date < startOfDay(min)) return true;
              if (max && date > endOfDay(max)) return true;
              return false;
            }}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}