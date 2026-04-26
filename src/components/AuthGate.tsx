import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * Auth is currently OPEN — guest accounts are auto-created.
 * This gate just ensures the auth system is ready before showing content.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}