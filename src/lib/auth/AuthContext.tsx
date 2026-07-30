import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * AUTH STUB — UI shell only.
 *
 * Real auth is still being designed on the backend (per-user identity for
 * role checks is an open item). This context deliberately contains no token
 * exchange, no session refresh, and no route enforcement: it only carries a
 * locally-selected role so role-based visibility can be designed now.
 */
export type AppRole = "kruti" | "editor" | "viewer";

export interface StubUser {
  email: string;
  role: AppRole;
}

interface AuthContextValue {
  user: StubUser | null;
  /** Local-only sign-in stub. Performs no network call. */
  signIn: (email: string, role: AppRole) => void;
  signOut: () => void;
  setRole: (role: AppRole) => void;
  /** UI-concept role check. Real enforcement depends on backend auth. */
  hasRole: (role: AppRole) => boolean;
}

const STORAGE_KEY = "auraai.auth.stub";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StubUser | null>(null);

  // Read after mount only — avoids SSR/hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as StubUser);
    } catch {
      /* ignore malformed stub state */
    }
  }, []);

  const persist = useCallback((next: StubUser | null) => {
    setUser(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — stub state stays in memory */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (email, role) => persist({ email, role }),
      signOut: () => persist(null),
      setRole: (role) => persist(user ? { ...user, role } : null),
      hasRole: (role) => user?.role === role,
    }),
    [user, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export const roleLabels: Record<AppRole, string> = {
  kruti: "Kruti · Compliance",
  editor: "Editor",
  viewer: "Viewer",
};
