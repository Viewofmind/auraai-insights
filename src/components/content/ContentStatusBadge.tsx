import {
  Lightbulb,
  ListTree,
  ListChecks,
  ListX,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Eye,
  CheckCircle2,
  PackageCheck,
  XCircle,
  FileDown,
  type LucideIcon,
} from "lucide-react";
import type { ContentStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Visual treatment for each backend state-machine value.
 * Note: no state is ever labelled "published" or "live". publish_ready and
 * exported are end states and neither means anything was distributed.
 */
export const contentStatusMeta: Record<
  ContentStatus,
  { label: string; icon: LucideIcon; className: string; dot: string; note: string }
> = {
  idea: {
    label: "Idea",
    icon: Lightbulb,
    className: "text-muted-foreground border-border/70 bg-muted/40",
    dot: "bg-muted-foreground/60",
    note: "Captured, not started",
  },
  outline_requested: {
    label: "Outline requested",
    icon: ListTree,
    className: "text-cyan border-cyan/40 bg-cyan/10",
    dot: "bg-cyan",
    note: "Awaiting outline",
  },
  outline_approved: {
    label: "Outline approved",
    icon: ListChecks,
    className: "text-cyan border-cyan/50 bg-cyan/15",
    dot: "bg-cyan",
    note: "Cleared to draft",
  },
  outline_rejected: {
    label: "Outline rejected",
    icon: ListX,
    className: "text-rose border-rose/40 bg-rose/10",
    dot: "bg-rose",
    note: "Outline sent back",
  },
  draft_generated: {
    label: "Draft generated",
    icon: FileText,
    className: "text-foreground border-border/70 bg-background/60",
    dot: "bg-foreground/70",
    note: "Draft ready for review",
  },
  compliance_review_pending: {
    label: "Compliance review pending",
    icon: ShieldAlert,
    className: "text-amber border-amber/45 bg-amber/10",
    dot: "bg-amber",
    note: "Blocked on compliance",
  },
  compliance_approved: {
    label: "Compliance approved",
    icon: ShieldCheck,
    className: "text-emerald border-emerald/40 bg-emerald/10",
    dot: "bg-emerald",
    note: "Compliance cleared",
  },
  review_pending: {
    label: "Review pending",
    icon: Eye,
    className: "text-amber border-amber/35 bg-amber/[0.07]",
    dot: "bg-amber",
    note: "Awaiting editorial review",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "text-emerald border-emerald/45 bg-emerald/15",
    dot: "bg-emerald",
    note: "Editorially approved",
  },
  publish_ready: {
    label: "Publish ready",
    icon: PackageCheck,
    className: "text-emerald border-emerald/60 bg-emerald/20",
    dot: "bg-emerald",
    note: "End state — not distributed anywhere",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "text-rose border-rose/50 bg-rose/15",
    dot: "bg-rose",
    note: "Terminated",
  },
  exported: {
    label: "Exported",
    icon: FileDown,
    className: "text-violet border-violet/45 bg-violet/12",
    dot: "bg-violet",
    note: "End state — file handed off, nothing auto-posted",
  },
};

/** Ordered as the state machine flows, for filters and legends. */
export const contentStatusOrder: ContentStatus[] = [
  "idea",
  "outline_requested",
  "outline_approved",
  "outline_rejected",
  "draft_generated",
  "compliance_review_pending",
  "compliance_approved",
  "review_pending",
  "approved",
  "publish_ready",
  "rejected",
  "exported",
];

export function ContentStatusBadge({
  status,
  className,
  showIcon = true,
}: {
  status: ContentStatus;
  className?: string;
  showIcon?: boolean;
}) {
  const meta = contentStatusMeta[status];
  const Icon = meta.icon;
  return (
    <span
      title={meta.note}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em]",
        meta.className,
        className,
      )}
    >
      {showIcon ? (
        <Icon className="h-3 w-3" strokeWidth={2.25} />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      )}
      {meta.label}
    </span>
  );
}
