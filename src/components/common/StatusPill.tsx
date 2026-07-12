import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/mock/agents";

const statusStyles: Record<AgentStatus, { dot: string; text: string; label: string }> = {
  live: { dot: "bg-emerald shadow-[0_0_10px_-2px_var(--emerald)]", text: "text-emerald", label: "Live" },
  paused: { dot: "bg-amber", text: "text-amber", label: "Paused" },
  error: { dot: "bg-rose", text: "text-rose", label: "Error" },
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
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        s.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot, status === "live" && "animate-pulse")} />
      {s.label}
    </span>
  );
}
