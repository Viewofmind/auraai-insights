import { CheckCircle2, AlertTriangle, Lock, HelpCircle, type LucideIcon } from "lucide-react";
import type { ContentTier } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * content_tier badge. Uses the same severity colour language as the rest of the
 * app: A = green (clear), B = amber (caution), C = red (blocked pre-RA).
 */
export const tierMeta: Record<
  ContentTier,
  { label: string; icon: LucideIcon; className: string; note: string }
> = {
  A: {
    label: "Tier A",
    icon: CheckCircle2,
    className: "text-emerald border-emerald/45 bg-emerald/10",
    note: "Clear — no additional sign-off required",
  },
  B: {
    label: "Tier B",
    icon: AlertTriangle,
    className: "text-amber border-amber/45 bg-amber/10",
    note: "Caution — requires compliance sign-off",
  },
  C: {
    label: "Tier C",
    icon: Lock,
    className: "text-rose border-rose/50 bg-rose/12",
    note: "Blocked pre-RA — cannot be prepared or sent",
  },
};

export function TierBadge({
  tier,
  className,
}: {
  tier: ContentTier | null | undefined;
  className?: string;
}) {
  if (!tier || !(tier in tierMeta)) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
          className,
        )}
      >
        <HelpCircle className="h-3 w-3" aria-hidden="true" />
        Tier unknown
      </span>
    );
  }

  const meta = tierMeta[tier];
  return (
    <span
      title={meta.note}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em]",
        meta.className,
        className,
      )}
    >
      <meta.icon className="h-3 w-3" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/** Tier B marker — distinct from the standard compliance_review_pending state. */
export function SignoffRequiredBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/[0.07] px-2.5 py-1 text-[10.5px] font-medium text-amber",
        className,
      )}
    >
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      Requires compliance sign-off
    </span>
  );
}
