import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { NotConnected } from "@/components/common/QueryState";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge, severityOrder } from "@/components/geo/GeoBadges";
import { isNotConnectedError } from "@/lib/api/client";
import { useTechnicalAudit } from "@/lib/api/hooks";
import type { GeoSeverity } from "@/lib/api/types";
import { AlertTriangle, Gauge, Lock, Search, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics/technical")({
  head: () => ({
    meta: [
      { title: "Technical SEO Audit — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Technical audit findings for InvestSights.in, ordered by severity — critical through ok, straight from the backend audit.",
      },
      { property: "og:title", content: "Technical SEO Audit — AuraAI · CMO" },
      {
        property: "og:description",
        content:
          "Severity-ordered technical_audit findings with detail and recommended fixes. No estimated or sample results.",
      },
    ],
  }),
  component: TechnicalTab,
});

function TechnicalTab() {
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const audit = useTechnicalAudit(url);

  const grouped = useMemo(() => {
    const findings = audit.data?.findings ?? [];
    return severityOrder
      .map((sev) => ({ sev, items: findings.filter((f) => f.severity === sev) }))
      .filter((g) => g.items.length > 0);
  }, [audit.data]);

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Analytics · Technical"
        title="Technical audit"
        description="Findings come from the backend technical_audit run, ordered by severity. Nothing is inferred in this UI."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setUrl(input.trim());
        }}
        className="mt-6 flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://investsights.in"
            aria-label="URL to audit"
            className="h-9 w-full rounded-md border border-border/70 bg-card/60 pl-9 pr-3 font-mono text-[12.5px] placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Wrench className="h-3.5 w-3.5" />
          Load audit
        </button>
      </form>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        GET /api/v1/seo/technical-audit
      </p>

      <div className="mt-6">
        {!url ? (
          <EmptyState
            icon={Wrench}
            title="No audit loaded"
            description="Enter a URL above to load its technical_audit findings from the backend."
          />
        ) : audit.isPending ? (
          <div className="space-y-2" aria-busy="true" aria-live="polite">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : audit.isError ? (
          isNotConnectedError(audit.error) ? (
            <NotConnected />
          ) : (
            <EmptyState
              icon={AlertTriangle}
              title="Could not load the audit"
              description={audit.error instanceof Error ? audit.error.message : "Unknown error."}
            />
          )
        ) : grouped.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No findings returned"
            description="The backend returned no technical findings for this URL."
          />
        ) : (
          <div className="space-y-6">
            {audit.data?.score != null && (
              <section className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  audit score
                </span>
                <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">
                  {audit.data.score}
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                {audit.data.checked_at && (
                  <p className="mt-1 font-mono text-[10.5px] text-muted-foreground">
                    checked {audit.data.checked_at}
                  </p>
                )}
              </section>
            )}

            {grouped.map(({ sev, items }) => (
              <section key={sev}>
                <div className="mb-2 flex items-center gap-2">
                  <SeverityBadge severity={sev as GeoSeverity} />
                  <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
                    {items.length} finding{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="space-y-2">
                  {items.map((f) => (
                    <li
                      key={f.id}
                      className={cn(
                        "rounded-lg border border-border/50 bg-card/40 p-3 sm:p-4",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{f.label}</span>
                        {f.category && (
                          <span className="rounded-sm border border-border/60 bg-background/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {f.category}
                          </span>
                        )}
                      </div>
                      {f.detail && (
                        <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground">
                          {f.detail}
                        </p>
                      )}
                      {f.recommendation && (
                        <p className="mt-2 border-l-2 border-cyan/40 pl-2.5 text-[12.5px] leading-snug text-foreground/85">
                          {f.recommendation}
                        </p>
                      )}
                      {f.affected_urls?.length ? (
                        <ul className="mt-2 space-y-0.5">
                          {f.affected_urls.map((u) => (
                            <li
                              key={u}
                              className="truncate font-mono text-[11px] text-muted-foreground"
                            >
                              {u}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Reserved: PageSpeed / Core Web Vitals */}
      <section className="mt-6 rounded-xl border border-dashed border-border/60 bg-card/30 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">
            PageSpeed &amp; Core Web Vitals
          </h2>
          <span className="rounded-full border border-border/60 bg-background/50 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            reserved
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-[12.5px] text-muted-foreground">
          Space held for mobile and desktop PageSpeed / CWV scores. The backend endpoint is being
          scoped — no scores are fetched or estimated here yet.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {["Mobile", "Desktop"].map((d) => (
            <div
              key={d}
              className="flex items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-3"
            >
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {d}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                <Lock className="h-3 w-3" /> not available
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
