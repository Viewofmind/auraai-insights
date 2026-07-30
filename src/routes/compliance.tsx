import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { EmptyState } from "@/components/common/EmptyState";
import { useComplianceDecision, useComplianceQueue } from "@/lib/api/hooks";
import type { ComplianceCategory } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { Check, X, ShieldAlert, Lock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance Review — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Compliance queue for InvestSights.in content — flagged categories with approve and reject decisions.",
      },
      { property: "og:title", content: "Compliance Review — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Flagged content awaiting a compliance decision, grouped by flag category.",
      },
    ],
  }),
  component: CompliancePage,
});

const categoryStyles: Record<ComplianceCategory, string> = {
  DIRECTIONAL_CALL: "text-amber border-amber/40 bg-amber/10",
  PRICE_TARGET: "text-rose border-rose/40 bg-rose/10",
  BUY_SELL_RECOMMENDATION: "text-rose border-rose/50 bg-rose/15",
  VALUATION_VERDICT: "text-cyan border-cyan/40 bg-cyan/10",
  PORTFOLIO_ADVICE: "text-violet border-violet/40 bg-violet/12",
  FORWARD_LOOKING_PERFORMANCE: "text-amber border-amber/30 bg-amber/[0.07]",
};

const allCategories = Object.keys(categoryStyles) as ComplianceCategory[];

function CompliancePage() {
  const { user, hasRole } = useAuth();
  const [category, setCategory] = useState<ComplianceCategory | "all">("all");
  const queue = useComplianceQueue();
  const decision = useComplianceDecision();

  // Role-based visibility as a UI concept only. Real enforcement depends on
  // backend auth, which is still pending.
  if (!hasRole("kruti")) {
    return (
      <div className="mx-auto max-w-[900px] p-4 sm:p-6 lg:p-8">
        <PageHeader
          eyebrow="Compliance"
          title="Restricted queue"
          description="This queue is scoped to the kruti compliance role."
        />
        <div className="mt-6">
          <EmptyState
            icon={Lock}
            title="Not visible in your role context"
            description={`Signed in as ${user ? `${user.email} (${user.role})` : "no one"}. Switch the role context to kruti to preview this screen. Visibility here is a UI concept — real enforcement lands with backend auth.`}
          />
        </div>
      </div>
    );
  }

  const filtered =
    category === "all"
      ? queue
      : ({ ...queue, data: queue.data?.filter((f) => f.category === category) } as typeof queue);

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Compliance · kruti"
        title="Compliance review"
        description="Flagged content awaiting a compliance decision. Approving here only advances the content state — it does not distribute anything."
      />

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/50 bg-card/30 px-3 py-2 text-[11.5px] text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          Role visibility is a UI concept for now. Per-user identity for real role checks
          is an open backend item.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-card/40 p-1">
        <button
          onClick={() => setCategory("all")}
          className={cn(
            "rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
            category === "all"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          All categories
        </button>
        {allCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
              category === c
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold tracking-tight">Flagged content</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            GET /api/v1/compliance/queue
          </span>
        </header>

        <div className="p-4 sm:p-5">
          <QueryState
            query={filtered}
            emptyIcon={ShieldAlert}
            emptyTitle="Nothing awaiting review"
            emptyDescription="Flagged items appear here once the backend compliance engine reports them."
          >
            {(flags) => (
              <ul className="space-y-3">
                {flags.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-lg border border-border/50 bg-background/40 p-3 sm:p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-md border px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.1em]",
                          categoryStyles[f.category],
                        )}
                      >
                        {f.category}
                      </span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                        {f.status}
                      </span>
                      <span className="ml-auto font-mono text-[10.5px] tabular-nums text-muted-foreground">
                        {f.flagged_at}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium">{f.content_title}</div>
                    <p className="mt-1 border-l-2 border-border/60 pl-3 text-[12.5px] leading-relaxed text-muted-foreground">
                      {f.excerpt}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        disabled={decision.isPending}
                        onClick={() => decision.mutate({ id: f.id, decision: "approve" })}
                        className="inline-flex items-center gap-1.5 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald transition-colors hover:bg-emerald/20 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        disabled={decision.isPending}
                        onClick={() => decision.mutate({ id: f.id, decision: "reject" })}
                        className="inline-flex items-center gap-1.5 rounded-md border border-rose/40 bg-rose/10 px-3 py-1.5 text-xs font-medium text-rose transition-colors hover:bg-rose/20 disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        POST /api/v1/compliance/{"{id}"}/decision
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </div>
      </section>
    </div>
  );
}
