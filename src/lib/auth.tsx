import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

interface StoredAccount extends AuthUser {
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const ACCOUNTS_KEY = "memorymesh:accounts";
const SESSION_KEY = "memorymesh:session";

const AuthContext = createContext<AuthContextValue | null>(null);

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeSession(user: AuthUser | null): void {
  if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let session = readSession();
    if (!session) {
      // Auto-create guest account if no session exists
      const guestUser: AuthUser = {
        id: crypto.randomUUID(),
        email: "guest@memorymesh.local",
        displayName: "Guest",
        createdAt: new Date().toISOString(),
      };
      writeSession(guestUser);

      // Also add to accounts for consistency
      const accounts = readAccounts();
      const guestAccount: StoredAccount = {
        ...guestUser,
        password: "guest",
      };
      if (!accounts.some((a) => a.email === guestUser.email)) {
        writeAccounts([...accounts, guestAccount]);
      }

      session = guestUser;
    }
    setUser(session);
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const accounts = readAccounts();
    const normalized = email.trim().toLowerCase();
    const found = accounts.find((a) => a.email === normalized);
    if (!found) {
      // Static demo: auto-create account if none exists for the email
      const newAccount: StoredAccount = {
        id: crypto.randomUUID(),
        email: normalized,
        displayName: normalized.split("@")[0] || "User",
        password,
        createdAt: new Date().toISOString(),
      };
      writeAccounts([...accounts, newAccount]);
      const { password: _pw, ...session } = newAccount;
      writeSession(session);
      setUser(session);
      return;
    }
    if (found.password !== password) {
      throw new Error("Incorrect password.");
    }
    const { password: _pw, ...session } = found;
    writeSession(session);
    setUser(session);
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const accounts = readAccounts();
    const normalized = email.trim().toLowerCase();
    if (accounts.some((a) => a.email === normalized)) {
      throw new Error("An account with this email already exists.");
    }
    const newAccount: StoredAccount = {
      id: crypto.randomUUID(),
      email: normalized,
      displayName: displayName.trim() || normalized.split("@")[0] || "User",
      password,
      createdAt: new Date().toISOString(),
    };
    writeAccounts([...accounts, newAccount]);
    const { password: _pw, ...session } = newAccount;
    writeSession(session);
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    writeSession(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, login, signup, logout }),
    [user, ready, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}