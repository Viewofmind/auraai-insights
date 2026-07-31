import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiFetch } from "./client";
import { endpoints } from "./config";
import type {
  AdminCredential,
  AuditLogEntry,
  ChannelConnection,
  ComplianceFlag,
  ContentChannel,
  ContentItem,
  ContentItemDetail,
  ContentStatus,
  CredentialProvider,
  GeoCitationCheck,
  GeoReadiness,
  HealthResponse,
  InfluencerContact,
  IntegrationConnection,
  IntegrationProvider,
  OutreachPlatform,
  PublishChannel,
  PublishResult,
  SeoKeyword,
} from "./types";

/**
 * Query hooks for the aura-cmo-backend contract.
 * Nothing retries: when no backend is configured the first failure is final,
 * and the UI renders a "not connected" state instead of placeholder data.
 */
const base = { retry: false, staleTime: 30_000 } as const;

export const queryKeys = {
  health: ["api", "health"] as const,
  content: (status?: ContentStatus | "all") => ["api", "content", status ?? "all"] as const,
  contentItem: (id: string) => ["api", "content", "item", id] as const,
  compliance: ["api", "compliance", "queue"] as const,
  auditLog: ["api", "audit-log"] as const,
  integrations: ["api", "google", "connections"] as const,
  seoKeywords: ["api", "seo", "keywords"] as const,
};

export function useHealth(): UseQueryResult<HealthResponse> {
  return useQuery({
    ...base,
    queryKey: queryKeys.health,
    queryFn: ({ signal }) => apiFetch<HealthResponse>(endpoints.health, { signal }),
  });
}

export function useContentQueue(
  status: ContentStatus | "all" = "all",
): UseQueryResult<ContentItem[]> {
  return useQuery({
    ...base,
    queryKey: queryKeys.content(status),
    queryFn: ({ signal }) =>
      apiFetch<ContentItem[]>(
        status === "all" ? endpoints.content : `${endpoints.content}?status=${status}`,
        { signal },
      ),
  });
}

export function useContentItem(id: string): UseQueryResult<ContentItemDetail> {
  return useQuery({
    ...base,
    queryKey: queryKeys.contentItem(id),
    queryFn: ({ signal }) =>
      apiFetch<ContentItemDetail>(endpoints.contentItem(id), { signal }),
  });
}

export function useComplianceQueue(): UseQueryResult<ComplianceFlag[]> {
  return useQuery({
    ...base,
    queryKey: queryKeys.compliance,
    queryFn: ({ signal }) => apiFetch<ComplianceFlag[]>(endpoints.complianceQueue, { signal }),
  });
}

export function useAuditLog(): UseQueryResult<AuditLogEntry[]> {
  return useQuery({
    ...base,
    queryKey: queryKeys.auditLog,
    queryFn: ({ signal }) => apiFetch<AuditLogEntry[]>(endpoints.auditLog, { signal }),
  });
}

export function useIntegrations(): UseQueryResult<IntegrationConnection[]> {
  return useQuery({
    ...base,
    queryKey: queryKeys.integrations,
    queryFn: ({ signal }) =>
      apiFetch<IntegrationConnection[]>(endpoints.googleConnections, { signal }),
  });
}

export function useSeoKeywords(): UseQueryResult<SeoKeyword[]> {
  return useQuery({
    ...base,
    queryKey: queryKeys.seoKeywords,
    queryFn: ({ signal }) => apiFetch<SeoKeyword[]>(endpoints.seoKeywords, { signal }),
  });
}

/* ---------------------------------- mutations --------------------------------- */

/** Topic intake: POST /api/v1/content — creates a new content item from a topic. */
export interface CreateContentInput {
  title: string;
  channel?: ContentChannel | null;
  target_keyword?: string | null;
  word_count?: number | null;
  owner?: string | null;
}

export function useCreateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContentInput) =>
      apiFetch<ContentItem>(endpoints.content, {
        method: "POST",
        body: {
          title: input.title,
          channel: input.channel ?? null,
          target_keyword: input.target_keyword ?? null,
          word_count: input.word_count ?? null,
          owner: input.owner ?? null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api", "content"] });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}


/**
 * Generation actions on a single item:
 *   POST /content/{id}/outline
 *   POST /content/{id}/outline/approve
 *   POST /content/{id}/draft
 */
export type ContentAction = "outline" | "outline_approve" | "outline_reject" | "draft";

const actionPath: Record<ContentAction, (id: string) => string> = {
  outline: endpoints.contentOutline,
  outline_approve: endpoints.contentOutlineApprove,
  outline_reject: endpoints.contentOutlineReject,
  draft: endpoints.contentDraft,
};

export function useContentAction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: ContentAction) =>
      apiFetch<ContentItemDetail>(actionPath[action](id), { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api", "content"] });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}

export function useContentTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; to_status: ContentStatus; note?: string }) =>
      apiFetch<ContentItem>(endpoints.contentTransition(vars.id), {
        method: "POST",
        body: { to_status: vars.to_status, note: vars.note },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api", "content"] });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}

export function useComplianceDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; decision: "approve" | "reject"; note?: string }) =>
      apiFetch<ComplianceFlag>(endpoints.complianceDecision(vars.id), {
        method: "POST",
        body: { decision: vars.decision, note: vars.note },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.compliance });
      qc.invalidateQueries({ queryKey: ["api", "content"] });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}

/** Starts the backend-owned Google OAuth flow. Not wired up yet. */
export function useStartGoogleOAuth() {
  return useMutation({
    mutationFn: (provider: IntegrationProvider) =>
      apiFetch<{ authorize_url: string }>(endpoints.googleOAuthStart(provider), {
        method: "POST",
      }),
  });
}

/* ----------------------------------- GEO ---------------------------------- */

export const geoQueryKeys = {
  readiness: (url: string) => ["api", "geo", "readiness", url] as const,
  citationCheck: (id: string) => ["api", "geo", "citations", id] as const,
};

/** GET /geo/readiness?url=... — only runs once a URL is submitted. */
export function useGeoReadiness(url: string): UseQueryResult<GeoReadiness> {
  return useQuery({
    ...base,
    enabled: url.trim().length > 0,
    queryKey: geoQueryKeys.readiness(url),
    queryFn: ({ signal }) => apiFetch<GeoReadiness>(endpoints.geoReadiness(url), { signal }),
  });
}

/** GET /geo/citations/{check_id} — past result. Manual only: no auto-refetch. */
export function useGeoCitationCheck(checkId: string): UseQueryResult<GeoCitationCheck> {
  return useQuery({
    ...base,
    enabled: checkId.trim().length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryKey: geoQueryKeys.citationCheck(checkId),
    queryFn: ({ signal }) =>
      apiFetch<GeoCitationCheck>(endpoints.geoCitationCheck(checkId), { signal }),
  });
}

export interface RunGeoCitationInput {
  url: string;
  brand?: string | null;
  queries?: string[] | null;
}

/**
 * POST /geo/citations — paid API calls per engine.
 * Must only ever be called from an explicit user confirmation.
 */
export function useRunGeoCitationCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RunGeoCitationInput) =>
      apiFetch<GeoCitationCheck>(endpoints.geoCitations, {
        method: "POST",
        body: {
          url: input.url,
          brand: input.brand ?? null,
          queries: input.queries ?? null,
        },
      }),
    onSuccess: (data) => {
      qc.setQueryData(geoQueryKeys.citationCheck(data.check_id), data);
    },
  });
}

/** POST /geo/check/{content_id} — paid; confirmation required before calling. */
export function useGeoCheckContent(contentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<GeoCitationCheck>(endpoints.geoCheckContent(contentId), { method: "POST" }),
    onSuccess: (data) => {
      qc.setQueryData(geoQueryKeys.citationCheck(data.check_id), data);
    },
  });
}

/* --------------------------- External channels ---------------------------- */

export const channelQueryKeys = {
  connections: ["api", "channels", "connections"] as const,
  influencers: ["api", "influencers"] as const,
};

export function useChannelConnections(): UseQueryResult<ChannelConnection[]> {
  return useQuery({
    ...base,
    queryKey: channelQueryKeys.connections,
    queryFn: ({ signal }) =>
      apiFetch<ChannelConnection[]>(endpoints.channelConnections, { signal }),
  });
}

/** Backend-owned OAuth start for X / LinkedIn. */
export function useStartChannelOAuth() {
  return useMutation({
    mutationFn: (channel: PublishChannel) =>
      apiFetch<{ authorize_url: string }>(endpoints.channelOAuthStart(channel), {
        method: "POST",
      }),
  });
}

/**
 * POST /content/{id}/publish/{channel} — publishes publicly under the real account.
 * Irreversible from this UI. Must only be called from the explicit
 * PublishConfirmDialog, and only for an item in publish_ready.
 * No retry wrapper: a failure requires a fresh confirmation.
 */
export function usePublishToChannel(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (channel: PublishChannel) =>
      apiFetch<PublishResult>(endpoints.contentPublish(id, channel), { method: "POST" }),
    retry: false,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api", "content"] });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}

/* --------------------------- Influencer outreach -------------------------- */

export function useInfluencers(): UseQueryResult<InfluencerContact[]> {
  return useQuery({
    ...base,
    queryKey: channelQueryKeys.influencers,
    queryFn: ({ signal }) => apiFetch<InfluencerContact[]>(endpoints.influencers, { signal }),
  });
}

export interface CreateInfluencerInput {
  name: string;
  platform: OutreachPlatform;
  handle: string;
  notes?: string | null;
}

export function useCreateInfluencer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInfluencerInput) =>
      apiFetch<InfluencerContact>(endpoints.influencers, {
        method: "POST",
        body: {
          name: input.name,
          platform: input.platform,
          handle: input.handle,
          notes: input.notes ?? null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelQueryKeys.influencers });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}

/** POST /influencers/{id}/outreach/draft — AI draft into the normal review queue. */
export function useGenerateOutreachDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<InfluencerContact>(endpoints.influencerOutreachDraft(id), { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelQueryKeys.influencers });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}

/**
 * POST /influencers/{id}/outreach/sent — bookkeeping only.
 * Nothing is transmitted: the human sends the message from their own account.
 */
export function useMarkOutreachSent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; message?: string | null }) =>
      apiFetch<InfluencerContact>(endpoints.influencerOutreachSent(vars.id), {
        method: "POST",
        body: { message: vars.message ?? null },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: channelQueryKeys.influencers });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}

/* ------------------------- Admin API credentials -------------------------- */

export const adminQueryKeys = {
  credentials: ["api", "admin", "credentials"] as const,
};

/** GET /admin/credentials — masked previews and metadata only, never secrets. */
export function useAdminCredentials(): UseQueryResult<AdminCredential[]> {
  return useQuery({
    ...base,
    queryKey: adminQueryKeys.credentials,
    queryFn: ({ signal }) => apiFetch<AdminCredential[]>(endpoints.adminCredentials, { signal }),
  });
}

/** PUT /admin/credentials/{provider} — write-only; the value is never read back. */
export function useSaveCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { provider: CredentialProvider; value: string }) =>
      apiFetch<AdminCredential>(endpoints.adminCredential(vars.provider), {
        method: "PUT",
        body: { value: vars.value },
      }),
    retry: false,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.credentials });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}

/** DELETE /admin/credentials/{provider} — clears a stored credential. */
export function useClearCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: CredentialProvider) =>
      apiFetch<AdminCredential>(endpoints.adminCredential(provider), { method: "DELETE" }),
    retry: false,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.credentials });
      qc.invalidateQueries({ queryKey: queryKeys.auditLog });
    },
  });
}
