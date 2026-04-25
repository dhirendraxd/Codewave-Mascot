import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-40 bg-transparent">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card shadow-[var(--shadow-ember)]">
              <span className="h-1.5 w-1.5 rounded-full bg-background" />
            </span>
            <span className="text-base font-semibold tracking-tight">MemoryMesh</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Open app</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="rounded-full px-5">
                <Link to="/login">Log in</Link>
              </Button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border/40 bg-background md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                {user ? (
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/dashboard">Open app</Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" className="flex-1 rounded-full">
                    <Link to="/login">Log in</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-border/40 bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_var(--ember-glow)]" />
              <span className="text-base font-semibold">MemoryMesh</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              An audio-first second brain. Speak your messy thoughts, recall them with AI.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">How it works</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/login" className="text-muted-foreground hover:text-foreground">Log in</Link></li>
              <li><Link to="/signup" className="text-muted-foreground hover:text-foreground">Sign up</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} MemoryMesh. All thoughts welcome.</p>
            <p>Built with care · Voice-first · AI-powered recall</p>
          </div>
        </div>
      </footer>
    </div>
  );
}