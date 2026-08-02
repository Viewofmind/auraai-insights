import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { NotConnected } from "@/components/common/QueryState";
import { Skeleton } from "@/components/ui/skeleton";
import { isNotConnectedError } from "@/lib/api/client";
import { useKeywordResearch } from "@/lib/api/hooks";
import type { SeoKeywordVariation } from "@/lib/api/types";
import {
  AlertTriangle,
  Link2,
  Loader2,
  Search,
  Target,
  Layers,
  Play,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/analytics/seo")({
  head: () => ({
    meta: [
      { title: "SEO Keyword Research — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Keyword research output for InvestSights.in: search intent, keyword clusters, and competitor gaps by source domain.",
      },
      { property: "og:title", content: "SEO Keyword Research — AuraAI · CMO" },
      {
        property: "og:description",
        content:
          "Intent classification, keyword variations and clusters, and competitor-gap keywords with their source domain.",
      },
    ],
  }),
  component: SeoTab,
});

function SeoTab() {
  const [seed, setSeed] = useState("");
  const [competitors, setCompetitors] = useState("");
  const research = useKeywordResearch();

  const clusters = useMemo(() => {
    const variations = research.data?.variations ?? [];
    const map = new Map<string, SeoKeywordVariation[]>();
    for (const v of variations) {
      const key = v.cluster?.trim() || "unclustered";
      map.set(key, [...(map.get(key) ?? []), v]);
    }
    return [...map.entries()];
  }, [research.data]);

  const field =
    "h-9 w-full rounded-md border border-border/70 bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20";
  const label = "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground";

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Analytics · SEO"
        title="Keyword research"
        description="Runs the backend keyword_research agent on demand. Nothing is shown until a real response comes back — no sample keywords."
      />

      {/* Run form */}
      <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold tracking-tight">Run research</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            POST /api/v1/seo/keyword-research
          </span>
        </header>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!seed.trim()) return;
            research.mutate({
              seed_keyword: seed.trim(),
              competitor_domains: competitors.trim()
                ? competitors
                    .split(",")
                    .map((d) => d.trim())
                    .filter(Boolean)
                : null,
            });
          }}
          className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5"
        >
          <div>
            <label htmlFor="seed-keyword" className={label}>
              seed_keyword
            </label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="seed-keyword"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="index fund taxation india"
                className={cn(field, "pl-9 font-mono text-[12.5px]")}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="competitor-domains" className={label}>
              competitor_domains (optional, comma-separated)
            </label>
            <input
              id="competitor-domains"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="groww.in, zerodha.com"
              className={cn(field, "mt-1 font-mono text-[12.5px]")}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={research.isPending || !seed.trim()}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {research.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Run keyword research
            </button>
          </div>
        </form>
      </section>

      {/* Results */}
      <div className="mt-6">
        {research.isPending ? (
          <div className="space-y-2" aria-busy="true" aria-live="polite">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : research.isError ? (
          isNotConnectedError(research.error) ? (
            <NotConnected />
          ) : (
            <EmptyState
              icon={AlertTriangle}
              title="Keyword research failed"
              description={
                research.error instanceof Error ? research.error.message : "Unknown error."
              }
            />
          )
        ) : !research.data ? (
          <EmptyState
            icon={Search}
            title="No research run yet"
            description="Enter a seed keyword above and run the research agent. Results appear here only from a real backend response."
          />
        ) : (
          <div className="space-y-6">
            {/* Intent */}
            <section className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan" />
                <h2 className="text-sm font-semibold tracking-tight">Search intent</h2>
              </div>
              <p className="mt-2 font-mono text-sm uppercase tracking-[0.14em] text-foreground">
                {research.data.primary_intent ?? "not classified"}
              </p>
              {research.data.intent_breakdown?.length ? (
                <div className="mt-4 space-y-2">
                  {research.data.intent_breakdown.map((b) => (
                    <div key={b.intent} className="flex items-center gap-3">
                      <span className="w-36 shrink-0 truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {b.intent}
                      </span>
                      <div className="h-1.5 flex-1 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-cyan"
                          style={{ width: `${Math.max(0, Math.min(100, b.share))}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                        {b.share}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[11.5px] text-muted-foreground">
                  No intent breakdown returned for this run.
                </p>
              )}
            </section>

            {/* Clusters */}
            <section className="rounded-xl border border-border/60 bg-card/50">
              <header className="flex items-center gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
                <Layers className="h-4 w-4 text-emerald" />
                <h2 className="text-sm font-semibold tracking-tight">
                  Keyword variations &amp; clusters
                </h2>
              </header>
              <div className="p-4 sm:p-5">
                {clusters.length === 0 ? (
                  <p className="text-[12.5px] text-muted-foreground">
                    No variations returned for this seed keyword.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {clusters.map(([cluster, items]) => (
                      <div key={cluster}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {cluster}
                          </span>
                          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                            {items.length}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1.5">
                          {items.map((v) => (
                            <li
                              key={`${cluster}-${v.keyword}`}
                              className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border/50 bg-background/40 px-3 py-2"
                            >
                              <span className="min-w-0 flex-1 truncate text-[13px]">
                                {v.keyword}
                              </span>
                              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                                {v.intent ?? "—"}
                              </span>
                              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                                vol {v.volume ?? "—"}
                              </span>
                              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                                kd {v.difficulty ?? "—"}
                              </span>
                              <Link
                                to="/content"
                                search={{ title: v.keyword, keyword: v.keyword }}
                                className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] font-medium hover:bg-muted/40"
                              >
                                Create topic
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Competitor gaps */}
            <section className="rounded-xl border border-border/60 bg-card/50">
              <header className="flex items-center gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
                <Link2 className="h-4 w-4 text-amber" />
                <h2 className="text-sm font-semibold tracking-tight">Competitor gaps</h2>
              </header>
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Competitor gap table, scrollable">
                {research.data.competitor_gaps.length === 0 ? (
                  <p className="p-4 text-[12.5px] text-muted-foreground sm:p-5">
                    No competitor-gap keywords returned for this run.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        <th className="px-4 py-2 font-normal sm:px-5">Keyword</th>
                        <th className="px-4 py-2 font-normal sm:px-5">Source domain</th>
                        <th className="px-4 py-2 text-right font-normal sm:px-5">Their pos.</th>
                        <th className="px-4 py-2 text-right font-normal sm:px-5">Our pos.</th>
                        <th className="px-4 py-2 text-right font-normal sm:px-5">Volume</th>
                        <th className="px-4 py-2 sm:px-5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {research.data.competitor_gaps.map((g) => (
                        <tr key={`${g.keyword}-${g.source_domain}`} className="hover:bg-muted/30">
                          <td className="px-4 py-3 sm:px-5">{g.keyword}</td>
                          <td className="px-4 py-3 font-mono text-[11.5px] text-muted-foreground sm:px-5">
                            {g.source_domain}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums sm:px-5">
                            {g.their_position ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground sm:px-5">
                            {g.our_position ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums sm:px-5">
                            {g.volume ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right sm:px-5">
                            <Link
                              to="/content"
                              search={{ title: g.keyword, keyword: g.keyword }}
                              className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] font-medium hover:bg-muted/40"
                            >
                              Create topic
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Reserved: backlinks / referring domains */}
      <section className="mt-6 rounded-xl border border-dashed border-border/60 bg-card/30 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">
            Backlinks &amp; referring domains
          </h2>
          <span className="rounded-full border border-border/60 bg-background/50 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            reserved
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[12.5px] text-muted-foreground">
          Space held for the backlink / referring-domains view. The backend endpoint is being
          scoped — nothing is fetched or estimated here yet.
        </p>
      </section>
    </div>
  );
}
