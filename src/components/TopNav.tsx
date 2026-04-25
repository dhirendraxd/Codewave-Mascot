import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "capture" | "chat";

interface TopNavProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onExport: () => void;
  exporting?: boolean;
}

export function TopNav({ mode, onModeChange, onExport, exporting }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_var(--ember-glow)]" />
          <span className="text-base font-semibold tracking-tight text-foreground">
            MemoryMesh
          </span>
        </div>

        <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
          {(["capture", "chat"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium tracking-wide uppercase transition-all",
                mode === m
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_-4px_var(--ember-glow)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={mode === m}
            >
              {m === "capture" ? "Capture" : "Chat"}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onExport}
          disabled={exporting}
          title="Export Daily Dump"
          aria-label="Export Daily Dump"
          className="text-muted-foreground hover:text-foreground"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}