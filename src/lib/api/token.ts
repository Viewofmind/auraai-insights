/**
 * Auth token store for the API client.
 *
 * Holds the real bearer token used for `Authorization: Bearer <token>` on
 * every backend call. Kept outside React so non-component code (apiFetch)
 * can read it synchronously; persisted so a reload keeps the session.
 */
const TOKEN_STORAGE_KEY = "auraai.api.token";

let token: string | null = null;
let hydrated = false;

export function getAuthToken(): string | null {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    try {
      token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      /* storage unavailable — memory only */
    }
  }
  return token;
}

export function setAuthToken(next: string | null): void {
  token = next && next.trim() ? next.trim() : null;
  hydrated = true;
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* storage unavailable — memory only */
  }
}
