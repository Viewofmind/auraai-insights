import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { NotConnected } from "@/components/common/QueryState";
import {
  useIntegrations,
  useStartGoogleOAuth,
  useChannelConnections,
  useStartChannelOAuth,
} from "@/lib/api/hooks";
import { API_BASE_URL, isApiConfigured } from "@/lib/api/config";
import { isNotConnectedError } from "@/lib/api/client";
import type { IntegrationProvider, PublishChannel } from "@/lib/api/types";
import { channelMeta } from "@/components/channels/ChannelBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, roleLabels, type AppRole } from "@/lib/auth/AuthContext";
import { BarChart3, Search, Plug, Info, AlertTriangle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Integrations & Settings — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Connection status for Google Search Console and GA4, backend configuration, and role context for AuraAI-CMO.",
      },
      { property: "og:title", content: "Integrations & Settings — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Backend and Google integration status for the AuraAI-CMO workspace.",
      },
    ],
  }),
  component: SettingsPage,
});

const providerMeta: Record<
  IntegrationProvider,
  { name: string; icon: typeof Search; blurb: string }
> = {
  gsc: {
    name: "Google Search Console",
    icon: Search,
    blurb: "Query, impression and position data for investsights.in.",
  },
  ga4: {
    name: "Google Analytics 4",
    icon: BarChart3,
    blurb: "Sessions, engagement and conversion data.",
  },
};

function SettingsPage() {
  const integrations = useIntegrations();
  const startOAuth = useStartGoogleOAuth();
  const { user, setRole } = useAuth();

  const byProvider = new Map((integrations.data ?? []).map((c) => [c.provider, c]));

  return (
    <div className="mx-auto max-w-[1100px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Settings"
        title="Integrations"
        description="Connection status only. The OAuth flow itself is owned by the backend — Connect calls its endpoint once the backend is deployed."
      />

      {/* Backend config */}
      <section className="mt-6 rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">Backend</h2>
          <span
            className={cn(
              "ml-auto rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
              isApiConfigured()
                ? "border-emerald/40 bg-emerald/10 text-emerald"
                : "border-amber/40 bg-amber/10 text-amber",
            )}
          >
            {isApiConfigured() ? "Configured" : "Not configured"}
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              VITE_API_BASE_URL
            </dt>
            <dd className="mt-0.5 break-all font-mono text-[12.5px] text-foreground">
              {API_BASE_URL || "unset"}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Contract
            </dt>
            <dd className="mt-0.5 font-mono text-[12.5px] text-foreground">
              /api/v1 · health, content, compliance, seo, google, audit-log
            </dd>
          </div>
        </dl>
        <p className="mt-3 flex items-start gap-2 text-[11.5px] text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Setting this environment variable is the only step left to go live — no URL is
          hardcoded anywhere in the app.
        </p>
      </section>

      {/* Google integrations */}
      <section className="mt-6 space-y-3">
        {(["gsc", "ga4"] as IntegrationProvider[]).map((provider) => {
          const meta = providerMeta[provider];
          const Icon = meta.icon;
          const conn = byProvider.get(provider);

          return (
            <div
              key={provider}
              className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-4 sm:flex-row sm:items-center sm:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{meta.name}</div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">{meta.blurb}</div>
                <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  {integrations.isPending ? (
                    <Skeleton className="h-3 w-40" />
                  ) : integrations.isError ? (
                    isNotConnectedError(integrations.error)
                      ? "status unknown — backend not connected"
                      : "status unavailable"
                  ) : conn?.connected ? (
                    `connected · ${conn.account ?? "account unknown"}${
                      conn.last_synced_at ? ` · synced ${conn.last_synced_at}` : ""
                    }`
                  ) : (
                    "not connected"
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                    conn?.connected
                      ? "border-emerald/40 bg-emerald/10 text-emerald"
                      : "border-border/70 bg-muted/40 text-muted-foreground",
                  )}
                >
                  {conn?.connected ? "Connected" : "Not connected"}
                </span>
                <button
                  onClick={() => startOAuth.mutate(provider)}
                  disabled={startOAuth.isPending}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {conn?.connected ? "Reconnect" : "Connect"}
                </button>
              </div>
            </div>
          );
        })}

        {startOAuth.isError && (
          <p className="flex items-start gap-2 rounded-lg border border-amber/30 bg-amber/[0.07] px-3 py-2 text-[11.5px] text-amber">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Connect calls{" "}
            <span className="font-mono">POST /api/v1/google/&#123;provider&#125;/oauth/start</span>,
            which is not reachable yet. Nothing was changed.
          </p>
        )}

        {integrations.isError && isNotConnectedError(integrations.error) && (
          <div className="pt-2">
            <NotConnected />
          </div>
        )}
      </section>

      <ChannelConnections />


      {/* Role context (stub) */}
      <section className="mt-6 rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight">Role context</h2>
        <p className="mt-1 text-[11.5px] text-muted-foreground">
          Local UI-only role switch so role-scoped screens can be reviewed. Real role
          checks require per-user identity from the backend, which is still pending.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-card/40 p-1">
          {(Object.keys(roleLabels) as AppRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              disabled={!user}
              className={cn(
                "rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors disabled:opacity-40",
                user?.role === r
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>
        {!user && (
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            Sign in on /login first (stub, no backend call)
          </p>
        )}
      </section>
    </div>
  );
}

/**
 * X / LinkedIn publishing channels.
 * A flag-gated channel (LINKEDIN_POSTING_ENABLED off) must never render a
 * normal Connect button — it states plainly why it is unavailable instead.
 */
function ChannelConnections() {
  const channels = useChannelConnections();
  const startOAuth = useStartChannelOAuth();
  const byChannel = new Map((channels.data ?? []).map((c) => [c.channel, c]));

  return (
    <section className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold tracking-tight">Publishing channels</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          GET /api/v1/channels
        </span>
      </div>

      {(["x", "linkedin"] as PublishChannel[]).map((ch) => {
        const conn = byChannel.get(ch);
        const gated = conn ? conn.posting_enabled === false : ch === "linkedin";
        const meta = channelMeta[ch];
        const Icon = meta.icon;

        return (
          <div
            key={ch}
            className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-4 sm:flex-row sm:items-center sm:p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{meta.label}</div>
              <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                Publishes short-form posts publicly under the connected account.
              </div>
              <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                {channels.isPending ? (
                  <Skeleton className="h-3 w-40" />
                ) : channels.isError ? (
                  isNotConnectedError(channels.error)
                    ? "status unknown — backend not connected"
                    : "status unavailable"
                ) : conn?.connected ? (
                  `connected · ${conn.account ?? "account unknown"}`
                ) : (
                  "not connected"
                )}
              </div>
              {gated && (
                <p className="mt-2 flex items-start gap-2 rounded-lg border border-amber/30 bg-amber/[0.07] px-2.5 py-1.5 text-[11.5px] text-amber">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {conn?.gated_reason ??
                    (ch === "linkedin"
                      ? "Pending approval — LinkedIn posting is gated off until LINKEDIN_POSTING_ENABLED is confirmed on by the backend. Connecting is intentionally unavailable, not broken."
                      : "Posting is disabled by a backend feature flag.")}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                  gated
                    ? "border-amber/40 bg-amber/10 text-amber"
                    : conn?.connected
                      ? "border-emerald/40 bg-emerald/10 text-emerald"
                      : "border-border/70 bg-muted/40 text-muted-foreground",
                )}
              >
                {gated
                  ? ch === "linkedin"
                    ? "Pending approval"
                    : "Not yet available"
                  : conn?.connected
                    ? "Connected"
                    : "Not connected"}
              </span>
              {gated ? (
                <span className="rounded-md border border-border/60 bg-muted/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Connect unavailable
                </span>
              ) : (
                <button
                  onClick={() => startOAuth.mutate(ch)}
                  disabled={startOAuth.isPending}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {conn?.connected ? "Reconnect" : "Connect"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {startOAuth.isError && (
        <p className="flex items-start gap-2 rounded-lg border border-amber/30 bg-amber/[0.07] px-3 py-2 text-[11.5px] text-amber">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Connect calls{" "}
          <span className="font-mono">POST /api/v1/channels/&#123;channel&#125;/oauth/start</span>,
          which is not reachable yet. Nothing was changed.
        </p>
      )}
    </section>
  );
}
