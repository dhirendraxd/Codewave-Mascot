import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * If the user is not authenticated, silently sign them in as a guest so
 * protected pages remain accessible without requiring real account signup.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready, loginAsGuest } = useAuth();

  useEffect(() => {
    if (ready && !user) {
      void loginAsGuest();
    }
  }, [ready, user, loginAsGuest]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}