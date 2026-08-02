import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert, ShieldCheck, Info, Ban, MailX } from "lucide-react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { NotConnected } from "@/components/common/QueryState";
import { TierBadge, SignoffRequiredBadge } from "@/components/email/TierBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { isNotConnectedError } from "@/lib/api/client";
import { useEmailCampaign } from "@/lib/api/hooks";

export const Route = createFileRoute("/_app/email/$id")({
  head: () => ({
    meta: [
      { title: "Campaign Draft — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Email campaign draft with content tier, compliance classifier result, and the mandatory disclaimer footer. Sending is not enabled.",
      },
      { property: "og:title", content: "Campaign Draft — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Draft and review view for an email campaign — no send action exists.",
      },
    ],
  }),
  component: CampaignDetailPage,
});

/** Shown verbatim in the preview when the backend has not supplied its own. */
const DEFAULT_DISCLAIMER =
  "InvestSights.in publishes research and educational content only. Nothing in this email is investment advice, a recommendation, or an offer to buy or sell any security. Markets carry risk; consider your own circumstances and consult a registered adviser before acting. You are receiving this because you confirmed a double opt-in subscription.";

function CampaignDetailPage() {
  const { id } = Route.useParams();
  const campaign = useEmailCampaign(id);

  return (
    <div>
      <Link
        to="/email"
        className="mb-4 inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to campaigns
      </Link>

      {campaign.isPending && (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      )}

      {campaign.isError &&
        (isNotConnectedError(campaign.error) ? (
          <NotConnected />
        ) : (
          <EmptyState
            icon={MailX}
            title="Could not load this campaign"
            description={
              campaign.error instanceof Error ? campaign.error.message : "Unknown error."
            }
          />
        ))}

      {campaign.data && (
        <>
          <PageHeader
            eyebrow="Email campaign · draft / review only"
            title={campaign.data.name}
            description={campaign.data.subject ?? "No subject line set yet."}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <TierBadge tier={campaign.data.content_tier} />
                {/* Deliberately inert: no send capability exists. */}
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="No send pipeline exists yet."
                  className="cursor-not-allowed rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground"
                >
                  Sending not yet enabled
                </button>
              </div>
            }
          />

          {campaign.data.content_tier === "B" && (
            <div className="mt-4">
              <SignoffRequiredBadge />
            </div>
          )}

          {campaign.data.content_tier === "C" && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose/35 bg-rose/[0.06] px-3 py-2.5">
              <Ban className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden="true" />
              <p className="text-[12px] leading-snug text-rose/90">
                <span className="font-medium">Locked — blocked pre-RA.</span>{" "}
                {campaign.data.blocked_reason ??
                  "Tier C material may not be prepared or distributed before Research Analyst registration is in place."}
              </p>
            </div>
          )}

          {/* Compliance classifier result — same display pattern as the content queue. */}
          <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                Compliance classifier
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {campaign.data.compliance_verdict ?? "No verdict reported"}
              </span>
            </header>
            <div className="p-3 sm:p-4">
              {campaign.data.compliance_findings && campaign.data.compliance_findings.length > 0 ? (
                <ul className="space-y-2">
                  {campaign.data.compliance_findings.map((f, i) => (
                    <li
                      key={`${f.category}-${i}`}
                      className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5"
                    >
                      <span className="inline-flex items-center rounded border border-amber/40 bg-amber/10 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-amber">
                        {String(f.category)}
                      </span>
                      {f.excerpt && (
                        <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
                          “{f.excerpt}”
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={ShieldCheck}
                  title="No classifier findings reported"
                  description="The backend has not returned any compliance findings for this campaign yet."
                />
              )}
            </div>
          </section>

          {/* Email preview, including the non-removable disclaimer footer. */}
          <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold tracking-tight">Email preview</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Read-only
              </span>
            </header>
            <div className="p-3 sm:p-5">
              {campaign.data.preview_text && (
                <p className="mb-3 text-[11.5px] italic text-muted-foreground">
                  Preview text: {campaign.data.preview_text}
                </p>
              )}
              {campaign.data.body_markdown ? (
                <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg border border-border/50 bg-background/60 p-4 text-[12.5px] leading-relaxed text-foreground">
                  {campaign.data.body_markdown}
                </pre>
              ) : (
                <EmptyState
                  icon={MailX}
                  title="No body copy yet"
                  description="This campaign has no draft body from the backend. Nothing is fabricated here."
                />
              )}

              {/* Locked disclaimer footer — always rendered, never editable. */}
              <div className="mt-4 rounded-lg border border-dashed border-border/70 bg-background/40 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  <Info className="h-3 w-3" aria-hidden="true" />
                  Mandatory disclaimer footer — not editable
                </div>
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                  {campaign.data.disclaimer_text ?? DEFAULT_DISCLAIMER}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
