import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAuthToken, setAuthToken } from "@/lib/api/token";

/**
 * Auth context.
 *
 * Role selection is still a local UI concept (backend per-user identity is an
 * open item), but the access token here is REAL: it is stored and sent as
 * `Authorization: Bearer <token>` on every API call by apiFetch.
 */
export type AppRole = "admin" | "kruti" | "editor" | "viewer";

export interface StubUser {
  email: string;
  role: AppRole;
}

interface AuthContextValue {
  user: StubUser | null;
  /** Bearer token attached to every backend request, if set. */
  token: string | null;
  /** Stores the session locally and installs the bearer token for API calls. */
  signIn: (email: string, role: AppRole, token?: string | null) => void;
  signOut: () => void;
  setRole: (role: AppRole) => void;
  setToken: (token: string | null) => void;
  /** UI-concept role check. Real enforcement depends on backend auth. */
  hasRole: (role: AppRole) => boolean;
}

const STORAGE_KEY = "auraai.auth.stub";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StubUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  // Read after mount only — avoids SSR/hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as StubUser);
    } catch {
      /* ignore malformed stub state */
    }
    setTokenState(getAuthToken());
  }, []);

  const persist = useCallback((next: StubUser | null) => {
    setUser(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — state stays in memory */
    }
  }, []);

  const applyToken = useCallback((next: string | null) => {
    setAuthToken(next);
    setTokenState(getAuthToken());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      signIn: (email, role, nextToken) => {
        persist({ email, role });
        if (nextToken !== undefined) applyToken(nextToken);
      },
      signOut: () => {
        persist(null);
        applyToken(null);
      },
      setRole: (role) => persist(user ? { ...user, role } : null),
      setToken: applyToken,
      hasRole: (role) => user?.role === role,
    }),
    [user, token, persist, applyToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  kruti: "Kruti · Compliance",
  editor: "Editor",
  viewer: "Viewer",
};
