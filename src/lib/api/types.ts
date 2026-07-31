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

export interface ContentItem {
  id: string;
  title: string;
  status: ContentStatus;
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
