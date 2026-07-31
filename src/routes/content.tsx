import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import {
  ContentStatusBadge,
  contentStatusMeta,
  contentStatusOrder,
} from "@/components/content/ContentStatusBadge";
import { useContentQueue, useCreateContent } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import type { ContentStatus } from "@/lib/api/types";
import { FileText, Search, Info, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Content Queue — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Content pipeline for InvestSights.in tracked against the backend state machine — idea through publish_ready and exported.",
      },
      { property: "og:title", content: "Content Queue — AuraAI · CMO" },
      {
        property: "og:description",
        content:
          "Every content item and its exact backend state: outline, draft, compliance, review, publish_ready, exported.",
      },
    ],
  }),
  component: ContentQueuePage,
});

function ContentQueuePage() {
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [query, setQuery] = useState("");
  const contentQuery = useContentQueue(status);

  const filteredQuery = useMemo(() => {
    if (!query) return contentQuery;
    const q = query.toLowerCase();
    return {
      ...contentQuery,
      data: contentQuery.data?.filter((c) =>
        `${c.title} ${c.target_keyword ?? ""} ${c.owner ?? ""}`.toLowerCase().includes(q),
      ),
    } as typeof contentQuery;
  }, [contentQuery, query]);

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Content Queue"
        title="Pipeline by state"
        description="Items are tracked against the backend content state machine. Nothing here is distributed automatically — publish_ready and exported are hand-off states only."
      />

      <TopicForm />



      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-card/40 p-1">
          <button
            onClick={() => setStatus("all")}
            className={cn(
              "rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
              status === "all"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All states
          </button>
          {contentStatusOrder.map((s) => {
            const meta = contentStatusMeta[s];
            const Icon = meta.icon;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                title={meta.note}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                  status === s
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, keyword, owner"
            className="h-9 w-full rounded-md border border-border/70 bg-card/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* End-state clarification */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/50 bg-card/30 px-3 py-2 text-[11.5px] text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          <span className="font-mono uppercase tracking-[0.12em] text-foreground/80">
            publish_ready
          </span>{" "}
          and{" "}
          <span className="font-mono uppercase tracking-[0.12em] text-foreground/80">
            exported
          </span>{" "}
          are the only end states. Neither means the piece went out anywhere — no channel
          is connected for automatic distribution.
        </p>
      </div>

      {/* Queue */}
      <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold tracking-tight">Queue</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            GET /api/v1/content
          </span>
        </header>

        <div className="p-4 sm:p-5">
          <QueryState
            query={filteredQuery}
            emptyIcon={FileText}
            emptyTitle="No content items"
            emptyDescription="Nothing matches this state yet. Items appear here once the backend content pipeline reports them."
          >
            {(items) => (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/40 p-3 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{item.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                        <span>{item.target_keyword ?? "no keyword"}</span>
                        <span>·</span>
                        <span>{item.owner ?? "unassigned"}</span>
                        <span>·</span>
                        <span className="tabular-nums">
                          {item.word_count != null ? `${item.word_count} words` : "—"}
                        </span>
                      </div>
                    </div>
                    <ContentStatusBadge status={item.status} className="shrink-0" />
                    <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-muted-foreground">
                      {new Date(item.updated_at).toISOString().slice(0, 16).replace("T", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </div>
      </section>

      {/* State legend */}
      <section className="mt-6 rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight">State machine</h2>
        <p className="mt-1 text-[11.5px] text-muted-foreground">
          Backend values, verbatim — the UI never renames or invents a state.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {contentStatusOrder.map((s) => (
            <div
              key={s}
              className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/40 px-3 py-2"
            >
              <ContentStatusBadge status={s} />
              <span className="truncate font-mono text-[10px] text-muted-foreground">
                {contentStatusMeta[s].note}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
