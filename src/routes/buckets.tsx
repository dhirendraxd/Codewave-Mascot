import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";

const BucketsContent = lazy(() => import("./buckets-content").then(module => ({ default: module.BucketsContent })));

export const Route = createFileRoute("/buckets")({
  head: () => ({ meta: [{ title: "Buckets — MemoryMesh" }] }),
  component: BucketsPage,
});

function BucketsPage() {
  return (
    <AuthGate>
      <AppShell>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <BucketsContent />
        </Suspense>
      </AppShell>
    </AuthGate>
  );
}