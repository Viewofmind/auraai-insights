/**
 * Session stores for the API client.
 *
 * `token` holds the real bearer token used for `Authorization: Bearer <token>`
 * on every backend call. `tenantId` holds the resolved tenant, sent as
 * `X-Tenant-Id`. Both are kept outside React so non-component code (apiFetch)
 * can read them synchronously; persisted so a reload keeps the session.
 */
const TOKEN_STORAGE_KEY = "auraai.api.token";
const TENANT_STORAGE_KEY = "auraai.api.tenant";

let token: string | null = null;
let hydrated = false;

let tenantId: string | null = null;
let tenantHydrated = false;

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable — memory only */
  }
}

export function getAuthToken(): string | null {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    token = read(TOKEN_STORAGE_KEY);
  }
  return token;
}

export function setAuthToken(next: string | null): void {
  token = next && next.trim() ? next.trim() : null;
  hydrated = true;
  write(TOKEN_STORAGE_KEY, token);
}

/** Tenant scope for outgoing requests. Defaults to whatever /auth/me returns. */
export function getTenantId(): string | null {
  if (!tenantHydrated && typeof window !== "undefined") {
    tenantHydrated = true;
    tenantId = read(TENANT_STORAGE_KEY);
  }
  return tenantId;
}

export function setTenantId(next: string | null): void {
  tenantId = next && next.trim() ? next.trim() : null;
  tenantHydrated = true;
  write(TENANT_STORAGE_KEY, tenantId);
}
