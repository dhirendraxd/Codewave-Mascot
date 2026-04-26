import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { getFirebaseAuth } from "@/lib/firebase";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  isGuest?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function readableAuthError(err: unknown): string {
  const code = (err as FirebaseError | undefined)?.code;
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase. Add it in Authentication > Settings > Authorized domains.";
    case "auth/popup-blocked":
      return "Popup was blocked by the browser. Allow popups and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completion.";
    case "auth/network-request-failed":
      return "Network error while contacting Firebase. Please check your connection.";
    case "auth/invalid-credential":
      return "Invalid credentials. Please try again.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "This email is already in use.";
    case "auth/weak-password":
      return "Password is too weak.";
    default:
      return err instanceof Error ? err.message : "Authentication failed.";
  }
}

function mapFirebaseUser(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  metadata: { creationTime?: string };
}): AuthUser {
  const fallbackEmail = user.email ?? "";
  const fallbackName = fallbackEmail.split("@")[0] || "User";
  return {
    id: user.uid,
    email: fallbackEmail,
    displayName: user.displayName || fallbackName,
    createdAt: user.metadata.creationTime || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const auth = getFirebaseAuth();
  const googleProvider = useMemo(() => new GoogleAuthProvider(), []);

  useEffect(() => {
    let mounted = true;

    // Check for stored guest user first
    const storedGuest = localStorage.getItem("memorymesh_guest_user");
    if (storedGuest) {
      try {
        const guestUser = JSON.parse(storedGuest) as AuthUser;
        if (guestUser.isGuest) {
          setUser(guestUser);
          setReady(true);
          return;
        }
      } catch {
        localStorage.removeItem("memorymesh_guest_user");
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!mounted) return;
      if (firebaseUser) {
        const mappedUser = mapFirebaseUser(firebaseUser);
        setUser(mappedUser);
        // If we had a guest user, sync their data
        const storedGuest = localStorage.getItem("memorymesh_guest_user");
        if (storedGuest) {
          try {
            const guestUser = JSON.parse(storedGuest) as AuthUser;
            if (guestUser.isGuest) {
              // Trigger data sync
              void (async () => {
                try {
                  const { syncGuestDataToFirebase } =
                    await import("./local-notes");
                  await syncGuestDataToFirebase(guestUser.id, mappedUser.id);
                  // Show success message
                  console.log("Guest data synced successfully!");
                } catch (error) {
                  console.error("Failed to sync guest data:", error);
                }
              })();
            }
          } catch {
            // ignore
          }
          localStorage.removeItem("memorymesh_guest_user");
        }
      } else {
        setUser(null);
      }
    });

    void (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!mounted) return;
        if (result?.user) {
          setUser(mapFirebaseUser(result.user));
        }
      } catch {
        // Ignore redirect-result errors; onAuthStateChanged will still update auth state.
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    })();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [auth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      setUser(mapFirebaseUser(credential.user));
    },
    [auth],
  );

  const loginAsGuest = useCallback(async () => {
    // Create a local guest user without Firebase
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestUser: AuthUser = {
      id: guestId,
      email: "",
      displayName: "Guest",
      createdAt: new Date().toISOString(),
      isGuest: true,
    };
    setUser(guestUser);
    // Store guest user in localStorage for persistence
    localStorage.setItem("memorymesh_guest_user", JSON.stringify(guestUser));
  }, []);

  const signup = useCallback(
    async (email: string, password: string, displayName: string) => {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const cleanName = displayName.trim();
      if (cleanName) {
        await updateProfile(credential.user, { displayName: cleanName });
      }
      setUser(
        mapFirebaseUser({
          ...credential.user,
          displayName: cleanName || credential.user.displayName,
        }),
      );
    },
    [auth],
  );

  const loginWithGoogle = useCallback(async () => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      setUser(mapFirebaseUser(credential.user));
    } catch (err) {
      const code = (err as FirebaseError | undefined)?.code;
      if (
        code === "auth/popup-blocked" ||
        code === "auth/cancelled-popup-request" ||
        code === "auth/popup-closed-by-user"
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw err;
    }
  }, [auth, googleProvider]);

  const logout = useCallback(() => {
    if (user?.isGuest) {
      // For guest users, just clear local state
      setUser(null);
      localStorage.removeItem("memorymesh_guest_user");
    } else {
      // For Firebase users, sign out
      void signOut(auth);
      setUser(null);
    }
  }, [auth, user?.isGuest]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      signup,
      loginWithGoogle,
      loginAsGuest,
      logout,
    }),
    [user, ready, login, signup, loginWithGoogle, loginAsGuest, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
