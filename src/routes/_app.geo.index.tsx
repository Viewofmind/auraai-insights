import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge, severityOrder } from "@/components/geo/GeoBadges";
import { isNotConnectedError } from "@/lib/api/client";
import { useGeoReadiness } from "@/lib/api/hooks";
import type { GeoSeverity } from "@/lib/api/types";
import { AlertTriangle, PlugZap, Radar, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/geo/")({
  head: () => ({
    meta: [
      { title: "GEO Readiness — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Audit how discoverable InvestSights is to AI answer engines and their crawlers.",
      },
      { property: "og:title", content: "GEO Readiness — AuraAI · CMO" },
      {
        property: "og:description",
        content: "llms.txt, AI-crawler robots rules, JSON-LD richness and entity signals.",
      },
    ],
  }),
  component: GeoReadinessPage,
});

const checkGroups = [
  "llms.txt presence",
  "AI-crawler robots.txt rules (GPTBot, ChatGPT-User, Claude-Web, PerplexityBot, Google-Extended)",
  "JSON-LD schema richness",
  "Brand / entity signals",
];

function GeoReadinessPage() {
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const readiness = useGeoReadiness(url);

  return (
    <>
      <PageHeader
        eyebrow="GEO · Generative Engine Optimization"
        title="AI discoverability readiness"
        description="Audits whether AI answer engines and their crawlers can find, parse and attribute this site. Every value comes from the backend audit — nothing is estimated here."
      />

      <form
        className="mt-6 flex flex-col gap-2 rounded-xl border border-border/60 bg-card/50 p-4 sm:flex-row sm:items-center sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          setUrl(input.trim());
        }}
      >
        <div className="flex-1">
          <label
            htmlFor="geo-url"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            URL to audit
          </label>
          <input
            id="geo-url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://investsights.in"
            className="mt-1 h-9 w-full rounded-md border border-border/60 bg-background/60 px-3 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <button
          type="submit"
          disabled={input.trim().length === 0}
          className="inline-flex h-9 items-center gap-2 self-end rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Search className="h-3.5 w-3.5" />
          Run audit
        </button>
      </form>
      <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
        GET /api/v1/geo/readiness?url=…
      </p>

      {url === "" && (
        <div className="mt-6">
          <EmptyState
            icon={Radar}
            title="No audit run yet"
            description={`Enter a URL to request a readiness audit. Checks cover: ${checkGroups.join(", ")}.`}
          />
        </div>
      )}

      {url !== "" && readiness.isPending && (
        <div className="mt-6 space-y-3" aria-busy="true">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {url !== "" && readiness.isError && (
        <div className="mt-6">
          <EmptyState
            icon={isNotConnectedError(readiness.error) ? PlugZap : AlertTriangle}
            title={isNotConnectedError(readiness.error) ? "Not connected" : "Audit failed"}
            description={
              readiness.error instanceof Error ? readiness.error.message : "Unknown error."
            }
            action={
              <button
                onClick={() => readiness.refetch()}
                className="rounded-md border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium hover:bg-muted/40"
              >
                Retry
              </button>
            }
          />
        </div>
      )}

      {readiness.data && (
        <>
          <ScoreCard
            score={readiness.data.geo_readiness_score}
            url={readiness.data.url}
            checkedAt={readiness.data.checked_at}
            checks={readiness.data.checks}
          />

          <section className="mt-4 rounded-xl border border-border/60 bg-card/50">
            <header className="border-b border-border/40 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold tracking-tight">Prioritized fixes</h2>
              <p className="text-[11px] text-muted-foreground">
                Ordered by severity, exactly as returned by the audit.
              </p>
            </header>
            {readiness.data.checks.length === 0 ? (
              <div className="px-5 py-10 text-center text-[12px] text-muted-foreground">
                The audit returned no findings.
              </div>
            ) : (
              <ul className="divide-y divide-border/40">
                {[...readiness.data.checks]
                  .sort(
                    (a, b) =>
                      severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
                  )
                  .map((c) => (
                    <li key={c.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:px-5">
                      <div className="sm:w-32 sm:shrink-0">
                        <SeverityBadge severity={c.severity} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium">{c.label}</h3>
                          {c.category && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                              {c.category}
                            </span>
                          )}
                        </div>
                        {c.detail && (
                          <p className="mt-1 text-[12.5px] text-muted-foreground">{c.detail}</p>
                        )}
                        {c.recommendation && (
                          <p className="mt-1.5 rounded-md border border-border/40 bg-background/50 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-foreground/80">
                            {c.recommendation}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}

function ScoreCard({
  score,
  url,
  checkedAt,
  checks,
}: {
  score: number;
  url: string;
  checkedAt: string;
  checks: { severity: GeoSeverity }[];
}) {
  const counts = severityOrder.map((s) => ({
    severity: s,
    count: checks.filter((c) => c.severity === s).length,
  }));
  const tone =
    score >= 80 ? "text-emerald" : score >= 55 ? "text-cyan" : score >= 30 ? "text-amber" : "text-rose";

  return (
    <section className="mt-6 flex flex-col gap-5 rounded-xl border border-border/60 bg-card/50 p-5 sm:flex-row sm:items-center">
      <div className="flex items-baseline gap-2">
        <span className={cn("font-mono text-5xl font-semibold tabular-nums", tone)}>{score}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          / 100
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          geo_readiness_score
        </div>
        <div className="truncate text-sm text-foreground">{url}</div>
        <div className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
          checked {new Date(checkedAt).toISOString().slice(0, 16).replace("T", " ")}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {counts
          .filter((c) => c.count > 0)
          .map((c) => (
            <div key={c.severity} className="flex items-center gap-1.5">
              <SeverityBadge severity={c.severity} />
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {c.count}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
}
