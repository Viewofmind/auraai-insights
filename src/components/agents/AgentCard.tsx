import type { Agent } from "@/lib/mock/agents";
import { StatusPill } from "@/components/common/StatusPill";
import { Sparkline } from "@/components/common/Sparkline";
import { Play, Settings2, ScrollText } from "lucide-react";

const accentToColor: Record<Agent["accent"], string> = {
  emerald: "var(--emerald)",
  cyan: "var(--cyan)",
  amber: "var(--amber)",
  rose: "var(--rose)",
  violet: "oklch(0.7 0.18 300)",
};

export function AgentCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon;
  const color = accentToColor[agent.accent];
  const disabled = agent.status !== "live";

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border/60 bg-card/50 p-5 transition-all duration-200 hover:border-border hover:bg-card hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]">
      {/* accent glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.16]"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-background/60"
            style={{ boxShadow: `inset 0 0 20px -8px ${color}` }}
          >
            <Icon className="h-4.5 w-4.5" style={{ color }} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">{agent.name}</div>
            <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
              {agent.role}
            </div>
          </div>
        </div>
        <StatusPill status={agent.status} />
      </div>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-3 gap-1 border-y border-border/40 py-3">
        <Metric label="Runs · 24h" value={agent.runsToday.toString()} />
        <Metric label="Success" value={`${agent.successRate.toFixed(1)}%`} />
        <Metric
          label="Latency"
          value={
            agent.avgLatencyMs >= 1000
              ? `${(agent.avgLatencyMs / 1000).toFixed(1)}s`
              : `${agent.avgLatencyMs}ms`
          }
        />
      </div>

      {/* Sparkline */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            7-day throughput
          </span>
        </div>
        <Sparkline data={agent.spark} color={color} height={32} />
      </div>

      {/* Last activity */}
      <div className="mt-4 rounded-md border border-border/40 bg-background/40 p-2.5">
        <div className="mb-0.5 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Last activity
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {agent.lastActivityAt}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-foreground/90">{agent.lastActivity}</p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-1.5">
        <button
          disabled={disabled}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="h-3 w-3" fill="currentColor" />
          Run now
        </button>
        <button
          title="Configure"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
        <button
          title="View logs"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ScrollText className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start px-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-0.5 font-mono text-sm font-medium tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
