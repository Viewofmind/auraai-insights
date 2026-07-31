import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmRunDialog } from "@/components/geo/ConfirmRunDialog";
import { VerdictBadge, engineLabel } from "@/components/geo/GeoBadges";
import { isNotConnectedError } from "@/lib/api/client";
import { useGeoCitationCheck, useRunGeoCitationCheck } from "@/lib/api/hooks";
import type { GeoCitationCheck } from "@/lib/api/types";
import {
  AlertTriangle,
  Check,
  History,
  Loader2,
  PlugZap,
  Quote,
  Play,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/geo/citations")({
  head: () => ({
    meta: [
      { title: "GEO Citation Check — AuraAI · CMO" },
      {
        name: "description",
        content:
          "See whether ChatGPT, Perplexity, Gemini and Claude mention the brand and cite the domain.",
      },
      { property: "og:title", content: "GEO Citation Check — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Per-engine brand mentions, domain citations and competitor domains cited.",
      },
    ],
  }),
  component: GeoCitationsPage,
});

function GeoCitationsPage() {
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [lookupInput, setLookupInput] = useState("");
  const [lookupId, setLookupId] = useState("");

  const run = useRunGeoCitationCheck();
  const past = useGeoCitationCheck(lookupId);

  const result: GeoCitationCheck | undefined = past.data ?? run.data;

  return (
    <>
      <PageHeader
        eyebrow="GEO · Citation check"
        title="Are AI answer engines citing us?"
        description="Manual runs only — each run makes paid API calls across four engines. Nothing on this screen auto-refreshes or re-runs."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* Run a new check */}
        <section className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
          <h2 className="text-sm font-semibold tracking-tight">Run a new check</h2>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            POST /api/v1/geo/citations · queries OpenAI/ChatGPT, Perplexity, Gemini and Claude.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field
              id="geo-cit-url"
              label="URL / domain"
              value={url}
              onChange={setUrl}
              placeholder="https://investsights.in"
            />
            <Field
              id="geo-cit-brand"
              label="Brand (optional)"
              value={brand}
              onChange={setBrand}
              placeholder="InvestSights"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ConfirmRunDialog
              disabled={url.trim().length === 0 || run.isPending}
              onConfirm={() =>
                run.mutate({ url: url.trim(), brand: brand.trim() || null })
              }
              description="Run citation check across 4 engines (ChatGPT, Perplexity, Gemini, Claude)? This uses paid API calls — a few cents per run."
              trigger={
                <button
                  type="button"
                  disabled={url.trim().length === 0 || run.isPending}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {run.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Run citation check
                </button>
              }
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
              Paid · ~cents per run
            </span>
          </div>

          {run.isError && (
            <p className="mt-3 text-[12px] text-rose">
              {isNotConnectedError(run.error)
                ? "Not connected — no backend is configured or reachable, so no check was run."
                : run.error instanceof Error
                  ? run.error.message
                  : "Request failed."}
            </p>
          )}
        </section>

        {/* Load a past result */}
        <section className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
          <h2 className="text-sm font-semibold tracking-tight">Load a past result</h2>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            GET /api/v1/geo/citations/&#123;check_id&#125; · free, no engine calls.
          </p>
          <form
            className="mt-4 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setLookupId(lookupInput.trim());
            }}
          >
            <Field
              id="geo-check-id"
              label="check_id"
              value={lookupInput}
              onChange={setLookupInput}
              placeholder="chk_…"
            />
            <button
              type="submit"
              disabled={lookupInput.trim().length === 0}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 text-xs font-medium hover:bg-muted/40 disabled:opacity-50"
            >
              <History className="h-3.5 w-3.5" />
              Load
            </button>
          </form>
          {past.isError && (
            <p className="mt-3 text-[12px] text-rose">
              {isNotConnectedError(past.error)
                ? "Not connected — no backend is configured or reachable."
                : past.error instanceof Error
                  ? past.error.message
                  : "Request failed."}
            </p>
          )}
        </section>
      </div>

      {(run.isPending || past.isPending) && (
        <div className="mt-4 space-y-3" aria-busy="true">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      )}

      {!result && !run.isPending && !past.isPending && (
        <div className="mt-4">
          <EmptyState
            icon={run.isError || past.isError ? (isNotConnectedError(run.error ?? past.error) ? PlugZap : AlertTriangle) : Quote}
            title="No citation results yet"
            description="Run a check or load a past check_id. Results always come from the backend — this screen never shows sample data."
          />
        </div>
      )}

      {result && <CitationResult result={result} />}
    </>
  );
}

function CitationResult({ result }: { result: GeoCitationCheck }) {
  return (
    <>
      <section className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl border border-border/60 bg-card/50 p-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Verdict
          </div>
          <div className="mt-1.5">
            <VerdictBadge verdict={result.verdict} />
          </div>
        </div>
        <Stat label="brand_mention_rate" value={pct(result.brand_mention_rate)} />
        <Stat label="domain_citation_rate" value={pct(result.domain_citation_rate)} />
        <div className="ml-auto text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            check_id
          </div>
          <div className="font-mono text-[11.5px] text-foreground">{result.check_id}</div>
          <div className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
            {new Date(result.created_at).toISOString().slice(0, 16).replace("T", " ")}
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border/60 bg-card/50">
          <header className="border-b border-border/40 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold tracking-tight">Per-engine results</h2>
          </header>
          {result.engines.length === 0 ? (
            <p className="px-5 py-10 text-center text-[12px] text-muted-foreground">
              No engine results returned.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {result.engines.map((e, i) => (
                <li key={`${e.engine}-${i}`} className="px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium">{engineLabel(e.engine)}</span>
                    <Flag ok={e.brand_mentioned} label="brand mentioned" />
                    <Flag ok={e.domain_cited} label="domain cited" />
                  </div>
                  {e.query && (
                    <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                      “{e.query}”
                    </p>
                  )}
                  {e.answer_excerpt && (
                    <p className="mt-2 rounded-md border border-border/40 bg-background/50 px-3 py-2 text-[12px] leading-relaxed text-foreground/80">
                      {e.answer_excerpt}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {e.competitor_domains_cited.length === 0 ? (
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                        no competitor domains cited
                      </span>
                    ) : (
                      e.competitor_domains_cited.map((d) => (
                        <span
                          key={d}
                          className="rounded border border-border/50 bg-background/50 px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground"
                        >
                          {d}
                        </span>
                      ))
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border/60 bg-card/50">
          <header className="border-b border-border/40 px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold tracking-tight">Top competitor domains cited</h2>
          </header>
          {result.top_competitor_domains.length === 0 ? (
            <p className="px-5 py-10 text-center text-[12px] text-muted-foreground">
              No competitor domains were cited in these answers.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {result.top_competitor_domains.map((d) => (
                <li
                  key={d.domain}
                  className="flex items-center justify-between px-4 py-3 sm:px-5"
                >
                  <span className="truncate font-mono text-[12px]">{d.domain}</span>
                  <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                    {d.citations}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

const pct = (v: number) => `${Math.round((v <= 1 ? v * 100 : v))}%`;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        ok ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-border/70 bg-muted/40 text-muted-foreground",
      )}
    >
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </span>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-9 w-full rounded-md border border-border/60 bg-background/60 px-3 text-sm outline-none focus:border-primary/50"
      />
    </div>
  );
}
