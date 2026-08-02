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
  /** POST — keyword_research output: intent, variations/clusters, competitor gaps. */
  seoKeywordResearch: "/seo/keyword-research",
  /** GET — technical_audit findings, severity-ordered. */
  seoTechnicalAudit: "/seo/technical-audit",

  /** Listening signals. Hacker News is read-only; Reddit is manual input only. */
  listeningHackernews: "/listening/hackernews",
  listeningRedditDraft: "/listening/reddit/draft",


  googleConnections: "/google/connections",
  googleOAuthStart: (provider: "gsc" | "ga4") => `/google/${provider}/oauth/start`,

  auditLog: "/audit-log",

  /** GEO — Generative Engine Optimization. */
  geoReadiness: (url: string) => `/geo/readiness?url=${encodeURIComponent(url)}`,
  geoCitations: "/geo/citations",
  geoCitationCheck: (checkId: string) => `/geo/citations/${checkId}`,
  geoCheckContent: (contentId: string) => `/geo/check/${contentId}`,

  /** External channel publishing (X / LinkedIn). */
  channelConnections: "/channels/connections",
  channelOAuthStart: (channel: "x" | "linkedin") => `/channels/${channel}/oauth/start`,
  contentPublish: (id: string, channel: "x" | "linkedin") => `/content/${id}/publish/${channel}`,

  /** Influencer outreach. */
  influencers: "/influencers",
  influencerOutreachDraft: (id: string) => `/influencers/${id}/outreach/draft`,
  influencerOutreachSent: (id: string) => `/influencers/${id}/outreach/sent`,

  /** Admin-only API credential vault. Values are write-only. */
  adminCredentials: "/admin/credentials",
  adminCredential: (provider: string) => `/admin/credentials/${provider}`,

  /**
   * Email marketing — scaffolding only. Backend shapes are still in flux, so
   * these paths are read-only/no-send today. There is deliberately NO send
   * endpoint here.
   */
  emailCampaigns: "/email/campaigns",
  emailCampaign: (id: string) => `/email/campaigns/${id}`,
  emailSubscribers: "/email/subscribers",
} as const;


