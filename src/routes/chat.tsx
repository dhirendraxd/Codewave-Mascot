import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChatView } from "@/components/ChatView";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — MemoryMesh" }] }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <AppShell>
      <ChatView />
    </AppShell>
  );
}