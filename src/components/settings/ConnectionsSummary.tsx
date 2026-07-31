import { useIntegrations, useChannelConnections } from "@/lib/api/hooks";
import { isNotConnectedError } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Gauge,
  Globe2,
  Linkedin,
  Search,
  Twitter,
  type LucideIcon,
} from "lucide-react";

type SummaryState = "connected" | "not_connected" | "gated" | "unknown" | "no_endpoint";

interface SummaryRow {
  id: string;
  name: string;
  icon: LucideIcon;
  state: SummaryState;
  detail: string;
}

const stateMeta: Record<SummaryState, { label: string; className: string; dot: string }> = {
  connected: {
    label: "Connected",
    className: "border-emerald/40 bg-emerald/10 text-emerald",
    dot: "bg-emerald",
  },
  not_connected: {
    label: "Not connected",
    className: "border-border/70 bg-muted/40 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  gated: {
    label: "Unavailable",
    className: "border-amber/40 bg-amber/10 text-amber",
    dot: "bg-amber",
  },
  unknown: {
    label: "Unknown",
    className: "border-border/70 bg-muted/40 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  no_endpoint: {
    label: "Not wired",
    className: "border-border/70 bg-muted/40 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

/**
 * Consolidated connection status.
 *
 * Every row is derived from a real response: GSC/GA4 from
 * GET /api/v1/google/connections and X/LinkedIn from
 * GET /api/v1/channels/connections. PageSpeed and Bing Webmaster have no
 * status endpoint in the /api/v1 contract yet, so they are reported as
 * "not wired" rather than guessed.
 */
export function ConnectionsSummary({ className }: { className?: string }) {
  const integrations = useIntegrations();
  const channels = useChannelConnections();

  const googleUnknown = integrations.isError;
  const channelsUnknown = channels.isError;
  const pending = integrations.isPending || channels.isPending;

  const byProvider = new Map((integrations.data ?? []).map((c) => [c.provider, c]));
  const byChannel = new Map((channels.data ?? []).map((c) => [c.channel, c]));

  const googleRow = (
    id: "gsc" | "ga4",
    name: string,
    icon: LucideIcon,
  ): SummaryRow => {
    const conn = byProvider.get(id);
    if (googleUnknown) {
      return {
        id,
        name,
        icon,
        state: "unknown",
        detail: isNotConnectedError(integrations.error)
          ? "backend unreachable — status not reported"
          : "status unavailable",
      };
    }
    return {
      id,
      name,
      icon,
      state: conn?.connected ? "connected" : "not_connected",
      detail: conn?.connected
        ? conn.account ?? "account not reported"
        : "no account authorised",
    };
  };

  const channelRow = (
    id: "x" | "linkedin",
    name: string,
    icon: LucideIcon,
  ): SummaryRow => {
    const conn = byChannel.get(id);
    if (channelsUnknown) {
      return {
        id,
        name,
        icon,
        state: "unknown",
        detail: isNotConnectedError(channels.error)
          ? "backend unreachable — status not reported"
          : "status unavailable",
      };
    }
    if (conn && conn.posting_enabled === false) {
      return {
        id,
        name,
        icon,
        state: "gated",
        detail: conn.gated_reason ?? "posting disabled by backend flag",
      };
    }
    return {
      id,
      name,
      icon,
      state: conn?.connected ? "connected" : "not_connected",
      detail: conn?.connected
        ? conn.account ?? "account not reported"
        : "no account authorised",
    };
  };

  const rows: SummaryRow[] = [
    googleRow("gsc", "Google Search Console", Search),
    googleRow("ga4", "Google Analytics 4", BarChart3),
    channelRow("x", "X (Twitter)", Twitter),
    channelRow("linkedin", "LinkedIn", Linkedin),
    {
      id: "pagespeed",
      name: "PageSpeed / Core Web Vitals",
      icon: Gauge,
      state: "no_endpoint",
      detail: "no status endpoint in /api/v1 yet",
    },
    {
      id: "bing",
      name: "Bing Webmaster",
      icon: Globe2,
      state: "no_endpoint",
      detail: "no status endpoint in /api/v1 yet",
    },
  ];

  const connectedCount = rows.filter((r) => r.state === "connected").length;

  return (
    <section
      aria-labelledby="connections-summary-heading"
      className={cn("rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5", className)}
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h2
            id="connections-summary-heading"
            className="truncate text-sm font-semibold tracking-tight"
          >
            Connections
          </h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Live status from the backend only — nothing is assumed.
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-border/70 bg-background/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {pending ? "checking…" : `${connectedCount}/${rows.length} connected`}
        </span>
      </header>

      {pending ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2" aria-busy="true" aria-live="polite">
          {rows.map((r) => (
            <Skeleton key={r.id} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {rows.map((row) => {
            const Icon = row.icon;
            const meta = stateMeta[row.state];
            return (
              <li
                key={row.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-card/60">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-foreground">
                    {row.name}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {row.detail}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                    meta.className,
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden="true" />
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
