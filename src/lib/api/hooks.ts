import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiFetch } from "./client";
import { endpoints } from "./config";
import type {
  AuditLogEntry,
  ComplianceFlag,
  ContentItem,
  ContentStatus,
  HealthResponse,
  IntegrationConnection,
  IntegrationProvider,
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
