import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * Auth is currently OPEN — no credentials required.
 * If no session exists, we silently sign the visitor in as a guest so every
 * protected page is accessible. The /login and /signup pages still work
 * normally for users who want to create a real account later.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready, login } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      // Auto-provision a guest account. The login() helper auto-creates
      // an account when the email isn't found, so this works offline.
      void login("guest@memorymesh.local", "guest");
    }
  }, [ready, user, login]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}