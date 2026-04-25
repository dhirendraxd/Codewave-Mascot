import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { readableAuthError, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — MemoryMesh" }] }),
  component: LoginPage,
});

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M21.35 12.27c0-.79-.07-1.54-.2-2.27H12v4.29h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.7 2.92-4.2 2.92-7.38Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.75c2.63 0 4.83-.87 6.43-2.35l-3.14-2.43c-.87.58-1.98.92-3.29.92-2.53 0-4.67-1.71-5.43-4h-3.24v2.51A9.72 9.72 0 0 0 12 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.57 13.89A5.85 5.85 0 0 1 6.26 12c0-.66.11-1.3.31-1.89V7.6H3.33A9.72 9.72 0 0 0 2.25 12c0 1.57.38 3.06 1.08 4.4l3.24-2.51Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.11c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.83 3.18 14.63 2.25 12 2.25a9.72 9.72 0 0 0-8.67 5.35l3.24 2.51c.76-2.29 2.9-4 5.43-4Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginPage() {
  const { login, loginWithGoogle, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard" });
  }, [ready, user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      await login(email, password);
      toast.success("Welcome back.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(readableAuthError(err));
    } finally {
      setPending(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (pending) return;
    setPending(true);
    try {
      await loginWithGoogle();
      toast.success("Signed in with Google.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(readableAuthError(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-aurora px-4">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,oklch(1_0_0/0.06)_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_14px_var(--ember-glow)]" />
          <span className="text-lg font-semibold tracking-tight text-foreground">MemoryMesh</span>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/85 p-6 shadow-xl backdrop-blur sm:p-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Welcome back. Pick up where your memory left off.
          </p>
          <Button type="button" variant="outline" disabled={pending} className="mt-5 w-full" onClick={handleGoogleLogin}>
            <GoogleLogo className="h-4 w-4" />
            Continue with Google
          </Button>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/70" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border/70" />
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <div className="flex items-center rounded-lg border border-border bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <Mail className="ml-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <div className="flex items-center rounded-lg border border-border bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <Lock className="ml-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  autoComplete="current-password"
                  className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}