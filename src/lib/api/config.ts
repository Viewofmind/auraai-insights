/**
 * API configuration.
 *
 * The backend (aura-cmo-backend) is NOT deployed yet. The base URL comes
 * exclusively from the VITE_API_BASE_URL environment variable — never
 * hardcoded. Until it is set, the app reports "not connected" everywhere
 * instead of falling back to fabricated data.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export const API_VERSION = "v1";

export const isApiConfigured = (): boolean => API_BASE_URL.length > 0;

export const apiUrl = (path: string): string =>
  `${API_BASE_URL}/api/${API_VERSION}${path.startsWith("/") ? path : `/${path}`}`;

/** Endpoint contract exposed by aura-cmo-backend (/api/v1). */
export const endpoints = {
  health: "/health",

  content: "/content",
  contentItem: (id: string) => `/content/${id}`,
  contentTransition: (id: string) => `/content/${id}/transition`,
  contentOutline: (id: string) => `/content/${id}/outline`,
  contentOutlineApprove: (id: string) => `/content/${id}/outline/approve`,
  contentOutlineReject: (id: string) => `/content/${id}/outline/reject`,
  contentDraft: (id: string) => `/content/${id}/draft`,

  complianceQueue: "/compliance/queue",
  complianceDecision: (id: string) => `/compliance/${id}/decision`,

  seoKeywords: "/seo/keywords",
  seoOpportunities: "/seo/opportunities",

  googleConnections: "/google/connections",
  googleOAuthStart: (provider: "gsc" | "ga4") => `/google/${provider}/oauth/start`,

  auditLog: "/audit-log",
} as const;
