import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const ChatView = lazy(() => import("@/components/ChatView").then(module => ({ default: module.ChatView })));

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — MemoryMesh" }] }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <ChatView />
      </Suspense>
    </AppShell>
  );
}