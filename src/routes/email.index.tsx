import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, ShieldAlert, Ban } from "lucide-react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { TierBadge, SignoffRequiredBadge, tierMeta } from "@/components/email/TierBadge";
import { useEmailCampaigns } from "@/lib/api/hooks";
import type { EmailCampaign } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email/")({
  head: () => ({
    meta: [
      { title: "Email Campaigns — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Draft-only email campaign list for InvestSights.in with content tier and compliance sign-off state. Sending is not enabled.",
      },
      { property: "og:title", content: "Email Campaigns — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Campaign drafts by content tier — review structure only, no send pipeline.",
      },
    ],
  }),
  component: EmailCampaignsPage,
});

const statusLabels: Record<string, string> = {
  draft: "Draft",
  compliance_review_pending: "Compliance review pending",
  compliance_signoff_required: "Sign-off required",
  approved: "Approved (not sendable)",
  blocked: "Blocked",
};

function statusLabel(status?: string | null) {
  if (!status) return "Status unknown";
  return statusLabels[status] ?? status.replace(/_/g, " ");
}

function EmailCampaignsPage() {
  const [query, setQuery] = useState("");
  const campaigns = useEmailCampaigns();

  const term = query.trim().toLowerCase();
  const filtered = term
    ? ({
        ...campaigns,
        data: campaigns.data?.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            (c.subject ?? "").toLowerCase().includes(term),
        ),
      } as typeof campaigns)
    : campaigns;

  return (
    <div>
      <PageHeader
        eyebrow="Email marketing · in development"
        title="Email campaigns"
        description="Campaign drafts, their content tier, and compliance state. Nothing here can be sent — the send pipeline does not exist on either side yet."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          aria-label="Search email campaigns"
          placeholder="Search campaigns…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 w-full max-w-xs rounded-md border border-border/60 bg-background/60 px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Tier legend so the colour coding is never unexplained. */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(["A", "B", "C"] as const).map((t) => (
          <div
            key={t}
            className="flex items-start gap-2 rounded-lg border border-border/50 bg-card/30 px-3 py-2"
          >
            <TierBadge tier={t} />
            <p className="text-[11.5px] leading-snug text-muted-foreground">{tierMeta[t].note}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold tracking-tight">Campaigns</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Draft / review only
          </span>
        </header>
        <div className="p-3 sm:p-4">
          <QueryState
            query={filtered}
            emptyIcon={Mail}
            emptyTitle="No campaigns yet"
            emptyDescription="No campaign records have come back from the backend. Sending is not active, so nothing is queued."
          >
            {(data) => (
              <ul className="space-y-2">
                {data.map((c) => (
                  <CampaignRow key={c.id} campaign={c} />
                ))}
              </ul>
            )}
          </QueryState>
        </div>
      </section>
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: EmailCampaign }) {
  const locked = campaign.content_tier === "C";
  const needsSignoff = campaign.content_tier === "B";

  const body = (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border px-3 py-3 sm:px-4",
        locked
          ? "border-dashed border-rose/35 bg-rose/[0.04]"
          : "border-border/50 bg-background/40 transition-colors hover:border-border hover:bg-background/70",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {locked && <Lock className="h-3.5 w-3.5 shrink-0 text-rose" aria-hidden="true" />}
            <span className="truncate text-[13.5px] font-medium text-foreground">
              {campaign.name}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
            {campaign.subject ? campaign.subject : "No subject line yet"}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={campaign.content_tier} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {statusLabel(campaign.status)}
          </span>
        </div>
      </div>

      {needsSignoff && (
        <div className="flex flex-wrap items-center gap-2">
          <SignoffRequiredBadge />
          <span className="text-[11px] text-muted-foreground">
            Distinct from the standard compliance review queue — a named sign-off is needed
            before this campaign could ever be prepared.
          </span>
        </div>
      )}

      {locked && (
        <div className="flex items-start gap-2 rounded-md border border-rose/30 bg-rose/[0.06] px-2.5 py-2">
          <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose" aria-hidden="true" />
          <p className="text-[11.5px] leading-snug text-rose/90">
            <span className="font-medium">Locked — blocked pre-RA.</span>{" "}
            {campaign.blocked_reason
              ? campaign.blocked_reason
              : "Tier C material may not be distributed before Research Analyst registration is in place. This campaign cannot be opened, prepared, or sent."}
          </p>
        </div>
      )}

      {campaign.compliance_categories && campaign.compliance_categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <ShieldAlert className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
          {campaign.compliance_categories.map((cat) => (
            <span
              key={cat}
              className="rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground"
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (locked) {
    return (
      <li aria-disabled="true">
        {body}
      </li>
    );
  }

  return (
    <li>
      <Link
        to="/email/$id"
        params={{ id: campaign.id }}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {body}
      </Link>
    </li>
  );
}
