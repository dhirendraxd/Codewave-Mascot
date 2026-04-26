import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const CaptureView = lazy(() =>
  import("@/components/CaptureView").then((module) => ({
    default: module.CaptureView,
  })),
);

export const Route = createFileRoute("/capture")({
  head: () => ({ meta: [{ title: "Capture — MemoryMesh" }] }),
  component: CapturePage,
});

function CapturePage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CaptureView />
      </Suspense>
    </AppShell>
  );
}
