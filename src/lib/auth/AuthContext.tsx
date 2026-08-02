import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, isNotConnectedError } from "@/lib/api/client";
import { endpoints } from "@/lib/api/config";
import { getAuthToken, setAuthToken, getTenantId, setTenantId } from "@/lib/api/token";
import type { CurrentUser } from "@/lib/api/types";

/**
 * Auth context — server truth only.
 *
 * Identity comes from `GET /api/v1/auth/me`, re-fetched whenever the bearer
 * token changes. There is no local user stub and no client-side role picker:
 * `role` and `tenant_id` are asserted by the backend. The resolved tenant is
 * installed as the `X-Tenant-Id` header for every subsequent request.
 */
export type AppRole = "admin" | "kruti" | "editor" | "viewer";

export type AuthStatus =
  | "anonymous"
  | "loading"
  | "authenticated"
  | "not-connected"
  | "error";

interface AuthContextValue {
  /** Real identity from /auth/me, or null when unresolved. */
  user: CurrentUser | null;
  status: AuthStatus;
  error: Error | null;
  /** Bearer token attached to every backend request, if set. */
  token: string | null;
  /** Tenant scope sent as X-Tenant-Id. Derived from /auth/me. */
  tenantId: string | null;
  /** Tenant display name when the endpoint provides one, else the id. */
  tenantLabel: string | null;
  /** Installs the bearer token; identity is then re-resolved from the server. */
  setToken: (token: string | null) => void;
  /** Clears the token, tenant scope and every cached tenant-scoped query. */
  signOut: () => void;
  /** Re-fetches /auth/me. */
  refresh: () => void;
  /** Server-asserted role check. */
  hasRole: (role: AppRole | string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const authQueryKey = ["api", "auth", "me"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Read persisted session after mount only — avoids SSR/hydration mismatch.
  useEffect(() => {
    setTokenState(getAuthToken());
    setHydrated(true);
  }, []);

  const query = useQuery({
    queryKey: [...authQueryKey, token ?? "anonymous"],
    queryFn: () => apiFetch<CurrentUser>(endpoints.authMe),
    enabled: hydrated && Boolean(token),
    retry: false,
    staleTime: 60_000,
  });

  const user = query.data ?? null;

  // Default the tenant scope to whatever /auth/me returned. No switcher today.
  useEffect(() => {
    if (user?.tenant_id && getTenantId() !== user.tenant_id) {
      setTenantId(user.tenant_id);
    }
  }, [user?.tenant_id]);

  const applyToken = useCallback(
    (next: string | null) => {
      setAuthToken(next);
      setTenantId(null);
      setTokenState(getAuthToken());
      // Identity and every tenant-scoped read belong to the previous session.
      queryClient.removeQueries({ queryKey: authQueryKey });
    },
    [queryClient],
  );

  const signOut = useCallback(() => {
    setAuthToken(null);
    setTenantId(null);
    setTokenState(null);
    void queryClient.cancelQueries();
    queryClient.clear();
  }, [queryClient]);

  const status: AuthStatus = !token
    ? "anonymous"
    : query.isPending || query.isLoading
      ? "loading"
      : query.isError
        ? isNotConnectedError(query.error)
          ? "not-connected"
          : "error"
        : user
          ? "authenticated"
          : "loading";

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      error: (query.error as Error | null) ?? null,
      token,
      tenantId: user?.tenant_id ?? null,
      tenantLabel: user ? (user.tenant_name?.trim() || user.tenant_id) : null,
      setToken: applyToken,
      signOut,
      refresh: () => void query.refetch(),
      hasRole: (role) => user?.role === role,
    }),
    [user, status, query, token, applyToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

const knownRoleLabels: Record<AppRole, string> = {
  admin: "Admin",
  kruti: "Kruti · Compliance",
  editor: "Editor",
  viewer: "Viewer",
};

/** Formats a server-asserted role; unknown values render verbatim. */
export function roleLabel(role: string | null | undefined): string {
  if (!role) return "No role";
  return knownRoleLabels[role as AppRole] ?? role;
}
