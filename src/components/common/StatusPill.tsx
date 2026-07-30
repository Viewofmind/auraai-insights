import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/mock/agents";

const statusStyles: Record<
  AgentStatus,
  { dot: string; text: string; label: string; ring: string; bg: string }
> = {
  live: {
    dot: "bg-emerald shadow-[0_0_10px_-1px_var(--emerald)]",
    text: "text-emerald",
    label: "Live",
    ring: "border-emerald/40",
    bg: "bg-emerald/10",
  },
  paused: {
    dot: "bg-amber",
    text: "text-amber",
    label: "Paused",
    ring: "border-amber/40",
    bg: "bg-amber/10",
  },
  error: {
    dot: "bg-rose shadow-[0_0_10px_-1px_var(--rose)]",
    text: "text-rose",
    label: "Error",
    ring: "border-rose/40",
    bg: "bg-rose/10",
  },
  disconnected: {
    dot: "bg-muted-foreground/60",
    text: "text-muted-foreground",
    label: "Not connected",
    ring: "border-border/70",
    bg: "bg-muted/40",
  },
};

export function StatusPill({
  status,
  className,
}: {
  status: AgentStatus;
  className?: string;
}) {
  const s = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em]",
        s.text,
        s.ring,
        s.bg,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot, status === "live" && "animate-pulse")} />
      {s.label}
    </span>
  );
}
