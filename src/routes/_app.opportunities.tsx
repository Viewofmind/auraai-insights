import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { EmptyState } from "@/components/common/EmptyState";
import { NotConnected } from "@/components/common/QueryState";
import { isNotConnectedError } from "@/lib/api/client";
import { useHackerNewsSignals, useRedditDraft } from "@/lib/api/hooks";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ExternalLink,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Radio,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Hacker News listening signals with relevance scores and suggested angles, plus a manual Reddit thread drafting tool.",
      },
      { property: "og:title", content: "Opportunities — AuraAI · CMO" },
      {
        property: "og:description",
        content:
          "Real listening signals only: Hacker News feed from the backend, and manual paste-in Reddit drafting through the review pipeline.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

type Tab = "hackernews" | "reddit";

function OpportunitiesPage() {
  const [tab, setTab] = useState<Tab>("hackernews");

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Opportunities"
        title="Signal feed"
        description="Listening signals come straight from the backend. Nothing is fetched or invented in this UI."
      />

      <div className="mt-6 flex w-fit items-center gap-1 rounded-md border border-border/60 bg-card/40 p-1">
        {(
          [
            { id: "hackernews", label: "Hacker News", icon: Radio },
            { id: "reddit", label: "Reddit tool", icon: MessageCircle },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === "hackernews" ? <HackerNewsFeed /> : <RedditTool />}</div>
    </div>
  );
}

function HackerNewsFeed() {
  const signals = useHackerNewsSignals();

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">Hacker News signals</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          GET /api/v1/listening/hackernews
        </span>
      </div>

      <QueryState
        query={signals}
        emptyIcon={Sparkles}
        emptyTitle="No signals yet"
        emptyDescription="The listening agent has not reported any Hacker News threads. Nothing is shown until it does."
      >
        {(items) => (
          <div className="space-y-3">
            {items.map((s) => {
              const score = s.relevance_score;
              const tone =
                score == null
                  ? "bg-border"
                  : score >= 85
                    ? "bg-emerald"
                    : score >= 70
                      ? "bg-cyan"
                      : "bg-amber";
              const toneText =
                score == null
                  ? "text-muted-foreground"
                  : score >= 85
                    ? "text-emerald"
                    : score >= 70
                      ? "text-cyan"
                      : "text-amber";
              return (
                <article
                  key={s.id}
                  className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/50 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 sm:p-5"
                >
                  <span className={cn("pointer-events-none absolute inset-y-0 left-0 w-[3px]", tone)} />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        <span>hacker news</span>
                        {s.detected_at && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="tabular-nums">{s.detected_at}</span>
                          </>
                        )}
                      </div>
                      <h3 className="mt-1 text-sm font-medium leading-snug">{s.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] tabular-nums text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" />
                          {s.points ?? "—"} points
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessagesSquare className="h-3 w-3" />
                          {s.comments ?? "—"} comments
                        </span>
                        {s.hn_url && (
                          <a
                            href={s.hn_url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-cyan hover:underline"
                          >
                            thread <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {s.url && (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-cyan hover:underline"
                          >
                            link <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {s.suggested_angle ? (
                        <p className="mt-3 border-l-2 border-cyan/40 pl-2.5 text-[12.5px] leading-snug text-foreground/85">
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            suggested angle
                          </span>
                          <br />
                          {s.suggested_angle}
                        </p>
                      ) : (
                        <p className="mt-3 text-[11.5px] text-muted-foreground">
                          No suggested angle returned for this signal.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3 sm:w-40 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0">
                      <div className="flex flex-col items-start sm:items-end">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={cn(
                              "font-mono text-2xl font-semibold leading-none tabular-nums",
                              toneText,
                            )}
                          >
                            {score ?? "—"}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            relevance
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 w-24 rounded-full bg-muted sm:w-full">
                          <div
                            className={cn("h-1 rounded-full", tone)}
                            style={{ width: `${Math.max(0, Math.min(100, score ?? 0))}%` }}
                          />
                        </div>
                      </div>
                      <Link
                        to="/content"
                        search={{
                          title: s.suggested_angle || s.title,
                          keyword: s.suggested_keyword ?? undefined,
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        Create topic from this <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </QueryState>
    </section>
  );
}

/** Manual-only Reddit tool: paste a thread URL and/or text, get a suggested angle/reply. */
function RedditTool() {
  const [threadUrl, setThreadUrl] = useState("");
  const [threadText, setThreadText] = useState("");
  const draft = useRedditDraft();

  const field =
    "w-full rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20";
  const label = "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground";
  const canSubmit = threadUrl.trim().length > 0 || threadText.trim().length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/60 bg-card/50">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold tracking-tight">Reddit manual draft</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            POST /api/v1/listening/reddit/draft
          </span>
        </header>
        <p className="border-b border-border/40 px-4 py-3 text-[12.5px] leading-snug text-muted-foreground sm:px-5">
          Manual input only — nothing is fetched from Reddit and nothing is posted back. The result
          goes through the same draft and compliance review pipeline as everything else, and you send
          any reply yourself.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            draft.mutate({ thread_url: threadUrl, thread_text: threadText });
          }}
          className="space-y-3 p-4 sm:p-5"
        >
          <div>
            <label htmlFor="reddit-url" className={label}>
              thread_url (optional)
            </label>
            <input
              id="reddit-url"
              value={threadUrl}
              onChange={(e) => setThreadUrl(e.target.value)}
              placeholder="https://reddit.com/r/IndiaInvestments/comments/..."
              className={cn(field, "mt-1 h-9 py-0 font-mono text-[12.5px]")}
            />
          </div>
          <div>
            <label htmlFor="reddit-text" className={label}>
              thread_text (paste the thread or question)
            </label>
            <textarea
              id="reddit-text"
              value={threadText}
              onChange={(e) => setThreadText(e.target.value)}
              rows={7}
              placeholder="Paste the thread title and the relevant comments here."
              className={cn(field, "mt-1 resize-y leading-relaxed")}
            />
          </div>
          <button
            type="submit"
            disabled={draft.isPending || !canSubmit}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {draft.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Generate suggested angle
          </button>
        </form>
      </section>

      {draft.isError &&
        (isNotConnectedError(draft.error) ? (
          <NotConnected />
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title="Draft generation failed"
            description={draft.error instanceof Error ? draft.error.message : "Unknown error."}
          />
        ))}

      {draft.data && (
        <section className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold tracking-tight">Suggested output</h3>
            {draft.data.status && (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                state {draft.data.status}
              </span>
            )}
          </div>
          {draft.data.suggested_angle && (
            <p className="mt-3 border-l-2 border-cyan/40 pl-2.5 text-[13px] leading-snug">
              {draft.data.suggested_angle}
            </p>
          )}
          {draft.data.draft_reply && (
            <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-border/50 bg-background/50 p-3 text-[12.5px] leading-relaxed">
              {draft.data.draft_reply}
            </pre>
          )}
          {draft.data.content_id && (
            <Link
              to="/content/$id"
              params={{ id: draft.data.content_id }}
              className="mt-4 inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 text-[11.5px] font-medium hover:bg-muted/40"
            >
              Open in review pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          )}
          <p className="mt-4 text-[11.5px] text-muted-foreground">
            You'll need to post any reply yourself — nothing is sent to Reddit from here.
          </p>
        </section>
      )}
    </div>
  );
}
