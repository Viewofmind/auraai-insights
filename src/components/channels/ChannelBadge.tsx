import { FileText, Linkedin, Twitter, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentChannel, PublishChannel } from "@/lib/api/types";

export const channelMeta: Record<
  ContentChannel,
  { label: string; icon: typeof FileText; className: string; kind: string }
> = {
  blog: {
    label: "Blog",
    icon: FileText,
    className: "text-primary border-primary/40 bg-primary/10",
    kind: "Long-form article",
  },
  x: {
    label: "X",
    icon: Twitter,
    className: "text-cyan border-cyan/40 bg-cyan/10",
    kind: "Short-form external post",
  },
  linkedin: {
    label: "LinkedIn",
    icon: Linkedin,
    className: "text-emerald border-emerald/40 bg-emerald/10",
    kind: "Short-form external post",
  },
};

export const publishChannelLabel = (channel: PublishChannel): string =>
  channelMeta[channel].label;

/**
 * Target channel for a content item. A missing value is shown as "unspecified"
 * rather than defaulted to blog — the UI never guesses where a post would go.
 */
export function ChannelBadge({
  channel,
  className,
}: {
  channel?: ContentChannel | null;
  className?: string;
}) {
  const meta = channel ? channelMeta[channel] : undefined;
  const Icon = meta?.icon ?? HelpCircle;

  return (
    <span
      title={meta ? meta.kind : "No channel reported by the backend"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em]",
        meta?.className ?? "text-muted-foreground border-border/70 bg-muted/40",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {meta?.label ?? "Unspecified"}
    </span>
  );
}
