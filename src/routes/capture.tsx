import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CaptureView } from "@/components/CaptureView";

export const Route = createFileRoute("/capture")({
  head: () => ({ meta: [{ title: "Capture — MemoryMesh" }] }),
  component: CapturePage,
});

function CapturePage() {
  return (
    <AppShell>
      <CaptureView />
    </AppShell>
  );
}