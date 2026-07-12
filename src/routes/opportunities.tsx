import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { opportunities, type OpportunitySource } from "@/lib/mock/opportunities";
import { EmptyState } from "@/components/common/EmptyState";
import {
  MessageCircle,
  Search,
  Globe,
  Twitter,
  Sparkles,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Actionable signals from Reddit, keywords, GEO, and X — ranked and ready to assign.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

const sources: { id: OpportunitySource | "all"; label: string; icon: typeof MessageCircle }[] = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "reddit", label: "Reddit", icon: MessageCircle },
  { id: "keyword", label: "Keywords", icon: Search },
  { id: "geo", label: "GEO", icon: Globe },
  { id: "x", label: "X", icon: Twitter },
];

function OpportunitiesPage() {
  const [source, setSource] = useState<OpportunitySource | "all">("all");
  const [minScore, setMinScore] = useState(0);

  const filtered = opportunities.filter(
    (o) => (source === "all" || o.source === source) && o.score >= minScore,
  );

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <PageHeader
        eyebrow="Opportunities"
        title="Signal feed"
        description="What the agents caught. Assign the ones that matter, dismiss the rest."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No opportunities match"
              description="Try lowering the minimum score or switching source."
            />
          ) : (
            filtered.map((op, i) => {
              const Src = sources.find((s) => s.id === op.source)?.icon ?? Sparkles;
              return (
                <div
                  key={op.id}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className="animate-in-up group flex gap-4 rounded-lg border border-border/60 bg-card/50 p-4 transition-colors hover:border-border hover:bg-card"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/60">
                    <Src className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {op.source} · {op.detectedAt}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-medium leading-snug">{op.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[12.5px] text-muted-foreground">
                      {op.snippet}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {op.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-sm border border-border/60 bg-background/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex w-32 shrink-0 flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                        {op.score}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        score
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-1 rounded-full",
                          op.score >= 85
                            ? "bg-emerald"
                            : op.score >= 70
                            ? "bg-cyan"
                            : "bg-amber",
                        )}
                        style={{ width: `${op.score}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:text-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20">
                        Assign <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-lg border border-border/60 bg-card/50 p-5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Source
            </div>
            <div className="mt-2 flex flex-col gap-1">
              {sources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSource(s.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    source === s.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Min. score
              </span>
              <span className="font-mono text-xs tabular-nums text-foreground">
                {minScore}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="mt-2 w-full accent-[oklch(0.72_0.17_155)]"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
