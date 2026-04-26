import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MeshView } from "@/components/MeshView";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Mesh — MemoryMesh" }] }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <AppShell>
      <MeshView />
    </AppShell>
  );
}