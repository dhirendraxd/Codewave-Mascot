import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { CalendarIcon, Copy, Download, LayoutDashboard, LogIn, LogOut, MessageSquare, Mic, Network, Boxes } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { getNotesForDateRange } from "@/lib/notes";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/capture", label: "Capture", icon: Mic },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/buckets", label: "Buckets", icon: Boxes },
  { to: "/graph", label: "Graph", icon: Network },
] as const;

const fallbackTimeZones = ["UTC", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Dubai", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"];

const timeZones = typeof Intl !== "undefined" && "supportedValuesOf" in Intl
  ? Intl.supportedValuesOf("timeZone")
  : fallbackTimeZones;

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatExportDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function zonedDateTimeParts(date: Date, timeZone: string): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value),
    day: Number(parts.find((p) => p.type === "day")?.value),
    hour: Number(parts.find((p) => p.type === "hour")?.value),
    minute: Number(parts.find((p) => p.type === "minute")?.value),
    second: Number(parts.find((p) => p.type === "second")?.value),
  };
}

function zonedDateParts(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const { year, month, day } = zonedDateTimeParts(date, timeZone);
  return { year, month, day };
}

function utcForZonedTime(parts: { year: number; month: number; day: number; hour: number; minute: number; second: number }, timeZone: string): Date {
  const targetUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  let guess = new Date(targetUtc);
  for (let i = 0; i < 5; i += 1) {
    const actual = zonedDateTimeParts(guess, timeZone);
    const actualUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    const diff = actualUtc - targetUtc;
    if (diff === 0) return guess;
    guess = new Date(guess.getTime() - diff);
  }
  return guess;
}

function nextDayParts(parts: { year: number; month: number; day: number }): { year: number; month: number; day: number } {
  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() };
}

function verifiedZonedDayBounds(date: Date, timeZone: string): { start: Date; end: Date; verified: boolean } {
  const { year, month, day } = zonedDateParts(date, timeZone);
  const endParts = nextDayParts({ year, month, day });
  const start = utcForZonedTime({ year, month, day, hour: 0, minute: 0, second: 0 }, timeZone);
  const end = utcForZonedTime({ ...endParts, hour: 0, minute: 0, second: 0 }, timeZone);
  const startCheck = zonedDateTimeParts(start, timeZone);
  const endCheck = zonedDateTimeParts(end, timeZone);
  const verified =
    startCheck.year === year &&
    startCheck.month === month &&
    startCheck.day === day &&
    startCheck.hour === 0 &&
    startCheck.minute === 0 &&
    endCheck.year === endParts.year &&
    endCheck.month === endParts.month &&
    endCheck.day === endParts.day &&
    endCheck.hour === 0 &&
    endCheck.minute === 0 &&
    end.getTime() > start.getTime();
  return { start, end, verified };
}

function formatBound(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatUtcBound(date: Date): string {
  return date.toISOString().slice(11, 16);
}

function formatCopyBounds(start: Date, end: Date, timeZone: string): string {
  return [`Local (${timeZone}): ${formatBound(start, timeZone)} → ${formatBound(end, timeZone)}`, `UTC: ${start.toISOString()} → ${end.toISOString()}`].join("\n");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportBounds, setExportBounds] = useState<string | null>(null);
  const [exportBoundsCopy, setExportBoundsCopy] = useState<string | null>(null);
  const [exportDate, setExportDate] = useState<Date>(new Date());
  const [exportTimeZone, setExportTimeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setExportBounds(null);
    setExportBoundsCopy(null);
    setExportProgress(15);
    try {
      setExportProgress(35);
      const { start, end, verified } = verifiedZonedDayBounds(exportDate, exportTimeZone);
      if (!verified) throw new Error("Timezone boundary verification failed.");
      setExportBounds(`${formatBound(start, exportTimeZone)} → ${formatBound(end, exportTimeZone)} · UTC ${formatUtcBound(start)}–${formatUtcBound(end)}`);
      setExportBoundsCopy(formatCopyBounds(start, end, exportTimeZone));
      const notes = (await getNotesForDateRange(start, end)).filter((n) => !n.userId || n.userId === user?.id);
      setExportProgress(60);
      if (notes.length === 0) {
        toast.message(`No memories for ${formatDateLabel(exportDate)}.`);
        return;
      }
      const md = notes
        .map(
          (n) =>
            `### ${pad(n.createdAt.getHours())}:${pad(n.createdAt.getMinutes())}\n${n.cleanedText}\nTags: ${n.keywords.join(", ")}\n---`,
        )
        .join("\n\n");
      setExportProgress(80);
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MemoryMesh_Export_${formatExportDate(exportDate)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportProgress(100);
      toast.success(`Exported ${notes.length} memories for ${formatDateLabel(exportDate)}.`, {
        description: exportTimeZone,
      });
    } catch (err) {
      toast.error("Export failed", {
        description: err instanceof Error ? err.message : "Couldn't create your Daily Dump.",
        duration: 8000,
        action: { label: "Retry", onClick: () => void handleExport() },
      });
    } finally {
      window.setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
        setExportBounds(null);
        setExportBoundsCopy(null);
      }, 350);
    }
  };

  const handleCopyBounds = async () => {
    if (!exportBoundsCopy) return;
    try {
      await navigator.clipboard.writeText(exportBoundsCopy);
      toast.success("Copied verified export bounds.");
    } catch (err) {
      toast.error("Couldn't copy bounds", {
        description: err instanceof Error ? err.message : "Clipboard access was blocked.",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-card/30 md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_var(--ember-glow)]" />
          <span className="text-base font-semibold tracking-tight text-foreground">MemoryMesh</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/60 p-3">
          {user ? (
            <>
              <div className="mb-2 px-2 text-xs">
                <div className="truncate font-medium text-foreground">{user.displayName}</div>
                <div className="truncate text-muted-foreground">{user.email}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="w-full">
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Sign in to save
              </Link>
            </Button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--ember-glow)]" />
            <span className="font-semibold tracking-tight">MemoryMesh</span>
          </div>
          <nav className="flex gap-1 md:hidden">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "rounded-md p-2",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {exporting && (
              <div className="hidden w-72 items-center gap-2 sm:flex" aria-label="Export progress">
                <div className="min-w-0 flex-1">
                  <Progress value={exportProgress} className="h-1.5" />
                  {exportBounds && <div className="mt-1 truncate text-[11px] text-muted-foreground">{exportBounds}</div>}
                </div>
                {exportBoundsCopy && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyBounds}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Copy verified export bounds"
                    title="Copy verified export bounds"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                )}
                <span className="text-xs tabular-nums text-muted-foreground">{exportProgress}%</span>
              </div>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={exporting}
                  className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
                  aria-label="Choose export date"
                  title="Choose export date"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {formatDateLabel(exportDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={exportDate}
                  onSelect={(date) => date && setExportDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Select value={exportTimeZone} onValueChange={setExportTimeZone} disabled={exporting}>
              <SelectTrigger className="hidden h-8 w-44 border-border/60 bg-background/40 text-xs text-muted-foreground hover:text-foreground sm:flex" aria-label="Export timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {timeZones.map((zone) => (
                  <SelectItem key={zone} value={zone} className="text-xs">
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="default"
              size="default"
              onClick={handleExport}
              disabled={exporting}
              aria-label="Export Daily Dump"
              title="Export Daily Dump"
              className="h-10 gap-2 px-4 font-medium shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Daily Dump</span>
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}