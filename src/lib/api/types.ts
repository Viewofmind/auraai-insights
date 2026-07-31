/** Types mirroring the aura-cmo-backend /api/v1 contract. */

/** Content state machine — backend values, verbatim. */
export type ContentStatus =
  | "idea"
  | "outline_requested"
  | "outline_approved"
  | "outline_rejected"
  | "draft_generated"
  | "compliance_review_pending"
  | "compliance_approved"
  | "review_pending"
  | "approved"
  | "publish_ready"
  | "rejected"
  | "exported";

/**
 * Distribution channel for a content item.
 * "blog" is a long-form article; "x" and "linkedin" are short-form external posts.
 * Backend values, verbatim. A missing/unknown value renders as "unspecified".
 */
export type ContentChannel = "blog" | "x" | "linkedin";

export interface ContentItem {
  id: string;
  title: string;
  status: ContentStatus;
  /** Optional until the backend adds it — never defaulted to a guess. */
  channel?: ContentChannel | null;
  target_keyword: string | null;
  word_count: number | null;
  owner: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Single-item read: GET /api/v1/content/{id}.
 * outline_json shape is backend-owned, so it stays unknown here and is
 * rendered generically rather than guessed at.
 */
export interface ContentItemDetail extends ContentItem {
  outline_json?: unknown | null;
  draft_markdown?: string | null;
  /** Exact text of a short-form external post (X / LinkedIn), when applicable. */
  post_text?: string | null;
  /** Set once the backend records an external publish. */
  published_at?: string | null;
  published_url?: string | null;
}

/** Compliance flag categories — backend values, verbatim. */
export type ComplianceCategory =
  | "DIRECTIONAL_CALL"
  | "PRICE_TARGET"
  | "BUY_SELL_RECOMMENDATION"
  | "VALUATION_VERDICT"
  | "PORTFOLIO_ADVICE"
  | "FORWARD_LOOKING_PERFORMANCE";

export interface ComplianceFlag {
  id: string;
  content_id: string;
  content_title: string;
  category: ComplianceCategory;
  excerpt: string;
  flagged_at: string;
  status: "pending" | "approved" | "rejected";
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  timestamp: string;
  content_id?: string | null;
}

export type IntegrationProvider = "gsc" | "ga4";

export interface IntegrationConnection {
  provider: IntegrationProvider;
  connected: boolean;
  account: string | null;
  scopes: string[];
  last_synced_at: string | null;
}

export interface HealthResponse {
  status: "ok" | "degraded" | "down";
  version: string;
}

export interface SeoKeyword {
  id: string;
  keyword: string;
  volume: number | null;
  difficulty: number | null;
  position: number | null;
}

/* --------------------------------- GEO ---------------------------------- */
/** Generative Engine Optimization — readiness audit + AI-answer citation checks. */

export type GeoSeverity = "critical" | "high" | "medium" | "low" | "ok";

export interface GeoReadinessCheck {
  id: string;
  label: string;
  severity: GeoSeverity;
  /** e.g. "llms_txt" | "robots" | "schema" | "entity" — backend-owned. */
  category?: string | null;
  detail?: string | null;
  recommendation?: string | null;
}

export interface GeoReadiness {
  url: string;
  geo_readiness_score: number;
  checked_at: string;
  checks: GeoReadinessCheck[];
}

export type GeoEngine = "openai" | "perplexity" | "gemini" | "claude";

export interface GeoEngineResult {
  engine: GeoEngine;
  query?: string | null;
  brand_mentioned: boolean;
  domain_cited: boolean;
  competitor_domains_cited: string[];
  answer_excerpt?: string | null;
}

export type GeoVerdict = "strong" | "cited" | "mentioned_only" | "invisible";

export interface GeoCompetitorDomain {
  domain: string;
  citations: number;
}

export interface GeoCitationCheck {
  check_id: string;
  url?: string | null;
  brand?: string | null;
  content_id?: string | null;
  created_at: string;
  brand_mention_rate: number;
  domain_citation_rate: number;
  verdict: GeoVerdict;
  engines: GeoEngineResult[];
  top_competitor_domains: GeoCompetitorDomain[];
}

/* --------------------------- External channels ---------------------------- */
/** Publishing to X / LinkedIn. Real, public, hard-to-undo actions. */

export type PublishChannel = "x" | "linkedin";

export interface ChannelConnection {
  channel: PublishChannel;
  connected: boolean;
  /** Handle or page the post would go out as, e.g. "@investsights". */
  account: string | null;
  scopes: string[];
  last_synced_at: string | null;
  /**
   * Backend feature flag (LINKEDIN_POSTING_ENABLED for LinkedIn).
   * When false/absent the channel is flag-gated off and must not offer Connect.
   */
  posting_enabled?: boolean | null;
  /** Optional backend explanation for a gated channel, shown verbatim. */
  gated_reason?: string | null;
}

export interface PublishResult {
  content_id: string;
  channel: PublishChannel;
  status: string;
  published_at: string | null;
  external_url: string | null;
}

/* --------------------------- Influencer outreach -------------------------- */

export type OutreachPlatform = "x" | "linkedin" | "email" | "other";

export type OutreachStatus = "no_draft" | "draft_generated" | "review_pending" | "approved" | "sent";

export interface InfluencerContact {
  id: string;
  name: string;
  platform: OutreachPlatform;
  /** Handle or email address. */
  handle: string;
  notes: string | null;
  outreach_status: OutreachStatus;
  draft_message: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

/* ------------------------- Admin API credentials -------------------------- */
/**
 * Sensitive third-party API credentials, managed by the admin role only.
 * The backend NEVER returns a stored secret: only a masked preview and
 * last-updated metadata come back over the wire.
 */
export type CredentialProvider =
  | "x"
  | "linkedin"
  | "perplexity"
  | "openai"
  | "anthropic"
  | "gemini";

export interface AdminCredential {
  provider: CredentialProvider;
  /** True once a value has been stored server-side. */
  configured: boolean;
  /** Masked preview, e.g. "••••1234". Never a full secret. */
  masked_value: string | null;
  last_updated_at: string | null;
  updated_by: string | null;
}

/* ----------------------------- SEO research ------------------------------ */
/** POST /api/v1/seo/keyword-research — keyword_research agent output. */

export interface SeoKeywordVariation {
  keyword: string;
  /** Cluster label the backend grouped this variation under. */
  cluster?: string | null;
  intent?: string | null;
  volume?: number | null;
  difficulty?: number | null;
}

export interface SeoCompetitorGap {
  keyword: string;
  /** Domain that ranks for this keyword while we don't. */
  source_domain: string;
  their_position?: number | null;
  our_position?: number | null;
  volume?: number | null;
  url?: string | null;
}

export interface SeoKeywordResearch {
  seed_keyword: string;
  /** e.g. "informational" | "commercial" — backend-owned, rendered verbatim. */
  primary_intent?: string | null;
  intent_breakdown?: { intent: string; share: number }[] | null;
  variations: SeoKeywordVariation[];
  competitor_gaps: SeoCompetitorGap[];
  generated_at?: string | null;
}

/* ---------------------------- Technical audit ---------------------------- */
/** GET /api/v1/seo/technical-audit — shares the severity scale with GEO. */

export interface TechnicalAuditFinding {
  id: string;
  label: string;
  severity: GeoSeverity;
  category?: string | null;
  detail?: string | null;
  recommendation?: string | null;
  /** Pages/URLs the finding applies to, when the backend reports them. */
  affected_urls?: string[] | null;
}

export interface TechnicalAudit {
  url?: string | null;
  score?: number | null;
  checked_at?: string | null;
  findings: TechnicalAuditFinding[];
}

/* --------------------------- Listening signals ---------------------------- */

/** GET /api/v1/listening/hackernews */
export interface HackerNewsSignal {
  id: string;
  title: string;
  url?: string | null;
  hn_url?: string | null;
  points: number | null;
  comments: number | null;
  relevance_score: number | null;
  /** Suggested content angle from the listening agent. */
  suggested_angle?: string | null;
  suggested_keyword?: string | null;
  detected_at?: string | null;
}

/** POST /api/v1/listening/reddit/draft — manual paste-in only, no fetching. */
export interface RedditDraftResult {
  /** Content item created in the normal draft/compliance pipeline, when applicable. */
  content_id?: string | null;
  suggested_angle?: string | null;
  draft_reply?: string | null;
  status?: string | null;
}
