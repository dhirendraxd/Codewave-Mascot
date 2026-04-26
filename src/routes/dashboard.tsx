import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  Calendar,
  Hash,
  Loader2,
  Mic,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth";
import { getAllNotes, type Note } from "@/lib/notes";
import { cn } from "@/lib/utils";
import { bucketColor, groupByBucket } from "@/lib/buckets";
import { notifyError } from "@/lib/errors";

const DashboardContent = lazy(() =>
  import("./dashboard-content").then((module) => ({
    default: module.DashboardContent,
  })),
);

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MemoryMesh" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AuthGate>
      <AppShell>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </AppShell>
    </AuthGate>
  );
}
