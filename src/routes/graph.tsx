import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

const GraphContent = lazy(() => import("./graph-content").then(module => ({ default: module.GraphContent })));

export const Route = createFileRoute("/graph")({
  head: () => ({ meta: [{ title: "Graph — MemoryMesh" }] }),
  component: GraphPage,
});

function GraphPage() {
  return (
    <AuthGate>
      <AppShell>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <GraphContent />
        </Suspense>
      </AppShell>
    </AuthGate>
  );
}