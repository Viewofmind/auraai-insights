import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { PlugZap, AlertTriangle } from "lucide-react";
import { isNotConnectedError } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/api/config";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Renders exactly three explicit states for a backend-backed screen:
 *  1. loading
 *  2. real data
 *  3. not connected / no data yet
 * Never a fabricated-looking placeholder.
 */
export function QueryState<T>({
  query,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  rows = 5,
  children,
}: {
  query: UseQueryResult<T[]>;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  rows?: number;
  children: (data: T[]) => ReactNode;
}) {
  if (query.isPending) {
    return (
      <div className="space-y-2" aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return isNotConnectedError(query.error) ? (
      <NotConnected />
    ) : (
      <EmptyState
        icon={AlertTriangle}
        title="Could not load this data"
        description={query.error instanceof Error ? query.error.message : "Unknown error."}
        action={
          <button
            onClick={() => query.refetch()}
            className="rounded-md border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/40"
          >
            Retry
          </button>
        }
      />
    );
  }

  const data = query.data ?? [];
  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children(data)}</>;
}

export function NotConnected({
  description = "No backend is configured yet. Set VITE_API_BASE_URL to the aura-cmo-backend URL — nothing else needs to change.",
}: {
  description?: string;
}) {
  return (
    <EmptyState
      icon={PlugZap}
      title="Not connected"
      description={
        API_BASE_URL
          ? `Configured backend at ${API_BASE_URL} is unreachable. No data is shown until it responds.`
          : description
      }
    />
  );
}
