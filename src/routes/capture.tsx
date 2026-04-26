import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MeshView } from "@/components/MeshView";

export const Route = createFileRoute("/capture")({
  head: () => ({ meta: [{ title: "Mesh — MemoryMesh" }] }),
  component: CapturePage,
});

function CapturePage() {
  return (
    <AppShell>
      <MeshView />
    </AppShell>
  );
}