import { Link } from "@tanstack/react-router";
import type { Agent } from "@/lib/mock/agents";
import { StatusPill } from "@/components/common/StatusPill";
import { Sparkline } from "@/components/common/Sparkline";
import { Play, Settings2, ScrollText, TrendingUp, Zap, Activity, type LucideIcon } from "lucide-react";

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
  const m = agent.metrics;
  const trend = m ? m.spark[m.spark.length - 1] - m.spark[0] : 0;
  const trendUp = trend >= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--primary)_45%,transparent)] sm:p-5">
      {/* top gradient accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      {/* corner ticks — terminal ornament */}
      <span className="pointer-events-none absolute left-2 top-2 h-2 w-2 border-l border-t border-border/70" />
      <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 border-r border-t border-border/70" />
      <span className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 border-b border-l border-border/70" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 border-b border-r border-border/70" />

      {/* accent glow */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-[0.08] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.20]"
        style={{ background: color }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/70"
            style={{
              boxShadow: `inset 0 0 28px -6px ${color}, 0 0 0 1px color-mix(in oklab, ${color} 22%, transparent), 0 8px 24px -12px ${color}`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.75} />
            {agent.status === "live" && (
              <span
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-card"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-tight text-foreground">
              {agent.name}
            </div>
            <div className="mt-0.5 line-clamp-1 text-[11.5px] leading-snug text-muted-foreground">
              {agent.role}
            </div>
          </div>
        </div>
        <StatusPill status={agent.status} className="shrink-0" />
      </div>

      {/* Hero metric — success rate */}
      <div className="relative mt-5 flex items-end justify-between gap-4 border-t border-border/40 pt-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Success rate
          </div>
          {m ? (
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className="font-mono text-3xl font-semibold tabular-nums tracking-tight"
                style={{ color }}
              >
                {m.successRate.toFixed(1)}
              </span>
              <span className="font-mono text-sm text-muted-foreground">%</span>
              <span
                className={`ml-1 inline-flex items-center gap-0.5 font-mono text-[10px] ${
                  trendUp ? "text-emerald" : "text-rose"
                }`}
              >
                <TrendingUp
                  className={`h-3 w-3 ${trendUp ? "" : "rotate-180"}`}
                  strokeWidth={2.5}
                />
                7d
              </span>
            </div>
          ) : (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-muted-foreground/50">
                —
              </span>
              <span className="text-[11px] text-muted-foreground">No data yet</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 pl-2">
          {m ? (
            <Sparkline data={m.spark} color={color} height={36} />
          ) : (
            <div className="h-[36px] rounded-md border border-dashed border-border/60" />
          )}
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric icon={Activity} label="Runs · 24h" value={m ? m.runsToday.toString() : "—"} />
        <Metric
          icon={Zap}
          label="Latency"
          value={
            m
              ? m.avgLatencyMs >= 1000
                ? `${(m.avgLatencyMs / 1000).toFixed(1)}s`
                : `${m.avgLatencyMs}ms`
              : "—"
          }
        />
      </div>

      {/* Last activity */}
      <div className="mt-4 rounded-lg border border-border/50 bg-background/50 p-2.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="mr-1 opacity-60">›</span>
            Last activity
          </span>
          {agent.lastActivityAt && (
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground/80">
              {agent.lastActivityAt}
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-[12.5px] leading-snug text-foreground/90">
          {agent.lastActivity ?? (
            <span className="text-muted-foreground">
              Not connected — connect a data source to stream activity.
            </span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-1.5">
        <Link
          to="/content"
          title="Start a new topic in the content queue"
          className="group/btn flex flex-1 items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_20px_-4px_color-mix(in_oklab,var(--primary)_60%,transparent)] disabled:cursor-not-allowed disabled:border-border/60 disabled:bg-muted/30 disabled:text-muted-foreground disabled:shadow-none"
        >
          <Play className="h-3 w-3 transition-transform group-hover/btn:scale-110" fill="currentColor" />
          New topic
        </Link>
        <button
          title="Configure"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
        <Link
          to="/audit"
          title="View logs"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <ScrollText className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-start rounded-md border border-border/40 bg-background/40 px-2.5 py-2 transition-colors group-hover:border-border/70">
      <span className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3 w-3 opacity-70" strokeWidth={2} />
        {label}
      </span>
      <span className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

