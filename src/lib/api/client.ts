import { API_BASE_URL, apiUrl, isApiConfigured } from "./config";
import { getAuthToken } from "./token";


/** Thrown when VITE_API_BASE_URL is not set — i.e. no backend is wired up. */
export class ApiNotConfiguredError extends Error {
  readonly notConnected = true;
  constructor() {
    super("No backend configured. Set VITE_API_BASE_URL to connect.");
    this.name = "ApiNotConfiguredError";
  }
}

/** Thrown when the backend is configured but unreachable or returns an error. */
export class ApiRequestError extends Error {
  readonly notConnected: boolean;
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
    // A transport failure (backend not deployed) reads as "not connected".
    this.notConnected = status === undefined;
  }
}

export const isNotConnectedError = (error: unknown): boolean =>
  Boolean(error && typeof error === "object" && "notConnected" in error && (error as { notConnected?: boolean }).notConnected);

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** Overrides the stored session token for this call only. */
  token?: string | null;
}


/**
 * Single typed entry point for every backend call. No mock fallbacks:
 * if the backend is not configured or unreachable, this throws so the UI
 * can render an honest "not connected" state.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!isApiConfigured()) throw new ApiNotConfiguredError();

  const { method = "GET", body, signal, token } = options;

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError(`Could not reach the backend at ${API_BASE_URL}.`);
  }

  if (!response.ok) {
    throw new ApiRequestError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
