import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { ContentStatusBadge } from "@/components/content/ContentStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { isNotConnectedError } from "@/lib/api/client";
import {
  useChannelConnections,
  useContentAction,
  useContentItem,
  useContentTransition,
  useGeoCheckContent,
  usePublishToChannel,
} from "@/lib/api/hooks";
import { ConfirmRunDialog } from "@/components/geo/ConfirmRunDialog";
import { VerdictBadge, engineLabel } from "@/components/geo/GeoBadges";
import { ChannelBadge } from "@/components/channels/ChannelBadge";
import { PublishConfirmDialog } from "@/components/channels/PublishConfirmDialog";
import type { ContentChannel, ContentStatus, PublishChannel } from "@/lib/api/types";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  ListTree,
  Loader2,
  PenLine,
  PlugZap,
  Radar,
  Send,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/content/$id")({
  head: () => ({
    meta: [
      { title: "Content item — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Single content item for InvestSights.in: outline, draft markdown, and the state transitions available from the backend.",
      },
      { property: "og:title", content: "Content item — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Outline, draft, and state transitions for one content item.",
      },
    ],
  }),
  component: ContentDetailPage,
});

function ContentDetailPage() {
  const { id } = Route.useParams();
  const item = useContentItem(id);
  const action = useContentAction(id);
  const transition = useContentTransition();
  const geo = useGeoCheckContent(id);

  const busy = action.isPending || transition.isPending;
  const error = action.error ?? transition.error;

  return (
    <div className="mx-auto max-w-[1100px] p-4 sm:p-6 lg:p-8">
      <Link
        to="/content"
        className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Content queue
      </Link>

      <PageHeader
        eyebrow={`GET /api/v1/content/${id}`}
        title={item.data?.title ?? "Content item"}
        description="Outline and draft come straight from the backend record. No content is generated or stored in this UI."
      />

      {item.isPending && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {item.isError && (
        <div className="mt-6">
          <EmptyState
            icon={isNotConnectedError(item.error) ? PlugZap : AlertTriangle}
            title={
              isNotConnectedError(item.error) ? "Not connected" : "Could not load this item"
            }
            description={
              item.error instanceof Error ? item.error.message : "Unknown error."
            }
            action={
              <button
                onClick={() => item.refetch()}
                className="rounded-md border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/40"
              >
                Retry
              </button>
            }
          />
        </div>
      )}

      {item.data && (
        <>
          {/* Meta */}
          <section className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
            <ContentStatusBadge status={item.data.status} />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {item.data.target_keyword ?? "no keyword"} · {item.data.owner ?? "unassigned"} ·{" "}
              {item.data.word_count != null ? `${item.data.word_count} words` : "—"}
            </span>
            <span className="ml-auto font-mono text-[10.5px] tabular-nums text-muted-foreground">
              updated {new Date(item.data.updated_at).toISOString().slice(0, 16).replace("T", " ")}
            </span>
          </section>

          {/* Actions */}
          <section className="mt-4 rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
            <h2 className="text-sm font-semibold tracking-tight">Actions</h2>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Each button is one backend call. The state shown above is whatever the backend
              reports afterwards — the UI never assumes a transition succeeded.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton
                icon={ListTree}
                label="Generate outline"
                hint="POST /content/{id}/outline"
                disabled={busy}
                pending={action.isPending && action.variables === "outline"}
                onClick={() => action.mutate("outline")}
              />
              <ActionButton
                icon={CheckCircle2}
                label="Approve outline"
                hint="POST /content/{id}/outline/approve"
                disabled={busy}
                pending={action.isPending && action.variables === "outline_approve"}
                onClick={() => action.mutate("outline_approve")}
              />
              <ActionButton
                icon={XCircle}
                label="Reject outline"
                hint="POST /content/{id}/outline/reject"
                disabled={busy}
                pending={action.isPending && action.variables === "outline_reject"}
                onClick={() => action.mutate("outline_reject")}
              />
              <ActionButton
                icon={PenLine}
                label="Generate draft"
                hint="POST /content/{id}/draft"
                disabled={busy}
                pending={action.isPending && action.variables === "draft"}
                onClick={() => action.mutate("draft")}
              />
            </div>

            <h3 className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Review
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <TransitionButton
                to="review_pending"
                label="Send to review"
                disabled={busy}
                pending={transition.isPending && transition.variables?.to_status === "review_pending"}
                onClick={() => transition.mutate({ id, to_status: "review_pending" })}
              />
              <TransitionButton
                to="approved"
                label="Approve"
                disabled={busy}
                pending={transition.isPending && transition.variables?.to_status === "approved"}
                onClick={() => transition.mutate({ id, to_status: "approved" })}
              />
              <TransitionButton
                to="publish_ready"
                label="Mark publish_ready"
                icon={Send}
                disabled={busy}
                pending={transition.isPending && transition.variables?.to_status === "publish_ready"}
                onClick={() => transition.mutate({ id, to_status: "publish_ready" })}
              />
              <TransitionButton
                to="rejected"
                label="Reject"
                icon={XCircle}
                disabled={busy}
                pending={transition.isPending && transition.variables?.to_status === "rejected"}
                onClick={() => transition.mutate({ id, to_status: "rejected" })}
              />
            </div>

            {error && (
              <p className="mt-3 text-[12px] text-rose-400">
                {error instanceof Error ? error.message : "Request failed."}
              </p>
            )}
          </section>

          {/* GEO citations — only once the piece is publish_ready or exported */}
          {(item.data.status === "publish_ready" || item.data.status === "exported") && (
            <section className="mt-4 rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-semibold tracking-tight">GEO citations</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
                  Paid · ~cents per run
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                POST /api/v1/geo/check/{id} · asks ChatGPT, Perplexity, Gemini and Claude whether
                they mention the brand and cite the domain. Manual trigger only — never scheduled,
                never automatic.
              </p>
              <div className="mt-4">
                <ConfirmRunDialog
                  disabled={geo.isPending}
                  onConfirm={() => geo.mutate()}
                  description="Run citation check across 4 engines (ChatGPT, Perplexity, Gemini, Claude) for this piece? This uses paid API calls — a few cents per run."
                  trigger={
                    <button
                      type="button"
                      disabled={geo.isPending}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan/40 bg-cyan/10 px-3 text-xs font-medium text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
                    >
                      {geo.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Radar className="h-3.5 w-3.5" />
                      )}
                      Check GEO Citations
                    </button>
                  }
                />
              </div>

              {geo.isError && (
                <p className="mt-3 text-[12px] text-rose">
                  {isNotConnectedError(geo.error)
                    ? "Not connected — no check was run."
                    : geo.error instanceof Error
                      ? geo.error.message
                      : "Request failed."}
                </p>
              )}

              {geo.data && (
                <div className="mt-4 rounded-lg border border-border/40 bg-background/50 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <VerdictBadge verdict={geo.data.verdict} />
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      brand {Math.round(geo.data.brand_mention_rate * 100)}% · domain{" "}
                      {Math.round(geo.data.domain_citation_rate * 100)}%
                    </span>
                    <Link
                      to="/geo/citations"
                      className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.14em] text-primary hover:underline"
                    >
                      check_id {geo.data.check_id}
                    </Link>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {geo.data.engines.map((e, i) => (
                      <li
                        key={`${e.engine}-${i}`}
                        className="flex items-center gap-3 font-mono text-[11.5px] text-muted-foreground"
                      >
                        <span className="w-40 shrink-0 text-foreground">
                          {engineLabel(e.engine)}
                        </span>
                        <span className={e.brand_mentioned ? "text-emerald" : ""}>
                          brand {e.brand_mentioned ? "yes" : "no"}
                        </span>
                        <span className={e.domain_cited ? "text-emerald" : ""}>
                          cited {e.domain_cited ? "yes" : "no"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* External publishing — publish_ready only, never earlier */}
          {item.data.status === "publish_ready" && (
            <ExternalPublishSection
              id={id}
              channel={item.data.channel ?? null}
              postText={item.data.post_text ?? item.data.draft_markdown ?? ""}
            />
          )}



          {/* Outline */}
          <section className="mt-4 rounded-xl border border-border/60 bg-card/50">
            <header className="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold tracking-tight">outline_json</h2>
              <ListTree className="h-3.5 w-3.5 text-muted-foreground" />
            </header>
            <div className="p-4 sm:p-5">
              {item.data.outline_json ? (
                <pre className="max-h-[420px] overflow-auto rounded-lg border border-border/40 bg-background/50 p-3 font-mono text-[11.5px] leading-relaxed text-foreground/90">
                  {JSON.stringify(item.data.outline_json, null, 2)}
                </pre>
              ) : (
                <p className="text-[12px] text-muted-foreground">
                  No outline yet. Use “Generate outline”.
                </p>
              )}
            </div>
          </section>

          {/* Draft */}
          <section className="mt-4 rounded-xl border border-border/60 bg-card/50">
            <header className="flex items-center justify-between border-b border-border/40 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold tracking-tight">draft_markdown</h2>
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            </header>
            <div className="p-4 sm:p-5">
                {item.data.draft_markdown ? (
                  <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg border border-border/40 bg-background/50 p-3 font-mono text-[12px] leading-relaxed text-foreground/90">
                    {item.data.draft_markdown}
                  </pre>
                ) : (
                <p className="text-[12px] text-muted-foreground">
                  No draft yet. Approve the outline, then use “Generate draft”.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/**
 * External publishing to X / LinkedIn.
 * Reachable only from publish_ready, gated behind PublishConfirmDialog,
 * and never retried automatically — a failure requires reconfirming.
 */
function ExternalPublishSection({
  id,
  channel,
  postText,
}: {
  id: string;
  channel: ContentChannel | null;
  postText: string;
}) {
  const connections = useChannelConnections();
  const publish = usePublishToChannel(id);

  const targets: PublishChannel[] =
    channel === "x" || channel === "linkedin" ? [channel] : ["x", "linkedin"];
  const byChannel = new Map((connections.data ?? []).map((c) => [c.channel, c]));

  return (
    <section className="mt-4 rounded-xl border border-amber/30 bg-card/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Publish externally</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
          Public · not undoable here
        </span>
      </div>
      <p className="mt-1 text-[11.5px] text-muted-foreground">
        POST /content/{id}/publish/&#123;channel&#125; · posts publicly under the connected
        account. The exact text is shown for confirmation first. Manual only — no retries,
        no polling.
      </p>

      <div className="mt-4 space-y-3">
        {targets.map((ch) => {
          const conn = byChannel.get(ch);
          const gated = conn ? conn.posting_enabled === false : false;
          const ready = Boolean(conn?.connected) && !gated && postText.trim().length > 0;

          return (
            <div key={ch} className="flex flex-wrap items-center gap-3">
              <ChannelBadge channel={ch} />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                {connections.isPending
                  ? "checking connection…"
                  : connections.isError
                    ? "connection status unknown — backend not connected"
                    : gated
                      ? (conn?.gated_reason ?? "posting disabled by backend feature flag")
                      : conn?.connected
                        ? `connected · ${conn.account ?? "account unknown"}`
                        : "not connected"}
              </span>
              <div className="ml-auto">
                <PublishConfirmDialog
                  channel={ch}
                  account={conn?.account ?? null}
                  postText={postText}
                  disabled={!ready || publish.isPending}
                  pending={publish.isPending && publish.variables === ch}
                  onPublish={() => publish.mutate(ch)}
                />
              </div>
            </div>
          );
        })}

        {postText.trim().length === 0 && (
          <p className="text-[11.5px] text-amber">
            No post text on this item yet — nothing can be published until the backend
            returns post_text or a draft.
          </p>
        )}

        {publish.isError && (
          <p className="text-[12px] text-rose-400">
            {isNotConnectedError(publish.error)
              ? "Not connected — nothing was published."
              : publish.error instanceof Error
                ? publish.error.message
                : "Publish failed."}{" "}
            Confirm again to retry.
          </p>
        )}

        {publish.data && (
          <p className="text-[12px] text-emerald-400">
            {publish.data.status}
            {publish.data.published_at ? ` · ${publish.data.published_at}` : ""}
            {publish.data.external_url ? (
              <>
                {" · "}
                <a
                  href={publish.data.external_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  view post
                </a>
              </>
            ) : null}
          </p>
        )}
      </div>
    </section>
  );
}


function ActionButton({
  icon: Icon,
  label,
  hint,
  disabled,
  pending,
  onClick,
}: {
  icon: typeof ListTree;
  label: string;
  hint: string;
  disabled?: boolean;
  pending?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={hint}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function TransitionButton({
  to,
  label,
  icon: Icon = CheckCircle2,
  disabled,
  pending,
  onClick,
}: {
  to: ContentStatus;
  label: string;
  icon?: typeof CheckCircle2;
  disabled?: boolean;
  pending?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={`POST /content/{id}/transition → ${to}`}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-50",
        to === "rejected"
          ? "border border-border/60 bg-background/60 text-rose-300 hover:bg-rose-500/10"
          : to === "publish_ready"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-border/60 bg-background/60 hover:bg-muted/40",
      )}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
