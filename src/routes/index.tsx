import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusPill } from "@/components/common/StatusPill";
import { Sparkline } from "@/components/common/Sparkline";
import { agents } from "@/lib/mock/agents";
import { opportunities } from "@/lib/mock/opportunities";
import { activity } from "@/lib/mock/activity";
import {
  Bot,
  Sparkles,
  FileText,
  Radio,
  ArrowRight,
  MessageCircle,
  Search as SearchIcon,
  Globe,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Live agent status, opportunities, and marketing activity across InvestSights.in.",
      },
    ],
  }),
  component: DashboardPage,
});

const sourceIcon = {
  reddit: MessageCircle,
  keyword: SearchIcon,
  geo: Globe,
  x: Twitter,
} as const;

function DashboardPage() {
  const liveAgents = agents.filter((a) => a.status === "live").length;

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <PageHeader
        eyebrow="Overview"
        title="Command Center"
        description="Real-time view of every agent, opportunity, and draft moving through InvestSights.in."
        actions={
          <>
            <div className="hidden items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-2.5 py-1.5 sm:flex">
              <span className="live-dot" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {liveAgents}/{agents.length} agents live
              </span>
            </div>
            <Link
              to="/agents"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open Agents Hub <ArrowRight className="h-3 w-3" />
            </Link>
          </>
        }
      />

      {/* KPI Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active Agents"
          value={`${liveAgents}`}
          hint={`of ${agents.length} configured`}
          delta={{ value: "+1", positive: true }}
          icon={<Bot className="h-3.5 w-3.5" />}
        />
        <KpiCard
          label="Opportunities · 24h"
          value="47"
          delta={{ value: "+18%", positive: true }}
          hint="7 high-priority"
          icon={<Sparkles className="h-3.5 w-3.5" />}
        />
        <KpiCard
          label="Drafts pending review"
          value="12"
          delta={{ value: "-3", positive: false }}
          hint="4 approved this week"
          icon={<FileText className="h-3.5 w-3.5" />}
        />
        <KpiCard
          label="Est. reach · 7d"
          value="284K"
          delta={{ value: "+22%", positive: true }}
          hint="Blog + LinkedIn + X"
          icon={<Radio className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Live Agents + Activity */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-border/60 bg-card/50 lg:col-span-2">
          <header className="flex items-center justify-between border-b border-border/40 px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Live agent status</h2>
              <p className="text-[11px] text-muted-foreground">Refreshed 4s ago</p>
            </div>
            <Link
              to="/agents"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </header>
          <div className="divide-y divide-border/40">
            {agents.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/60">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{a.name}</span>
                      <StatusPill status={a.status} />
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                      {a.lastActivity}
                    </div>
                  </div>
                  <div className="hidden w-32 shrink-0 md:block">
                    <Sparkline
                      data={a.spark}
                      color={
                        a.status === "error"
                          ? "var(--rose)"
                          : a.status === "paused"
                          ? "var(--amber)"
                          : "var(--emerald)"
                      }
                      height={24}
                    />
                  </div>
                  <div className="w-16 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                    {a.lastActivityAt}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-border/60 bg-card/50">
          <header className="flex items-center justify-between border-b border-border/40 px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Activity feed</h2>
              <p className="text-[11px] text-muted-foreground">Last 6 hours</p>
            </div>
          </header>
          <div className="max-h-[520px] overflow-y-auto">
            <ul className="relative divide-y divide-border/40">
              {activity.map((ev) => (
                <li key={ev.id} className="flex gap-3 px-5 py-3">
                  <div className="mt-1.5 flex flex-col items-center">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        ev.kind === "success" && "bg-emerald",
                        ev.kind === "info" && "bg-cyan",
                        ev.kind === "warn" && "bg-amber",
                        ev.kind === "error" && "bg-rose",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-foreground">
                        {ev.agent}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {ev.at}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                      {ev.message}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Recent opportunities */}
      <section className="mt-6 rounded-lg border border-border/60 bg-card/50">
        <header className="flex items-center justify-between border-b border-border/40 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Recent opportunities</h2>
            <p className="text-[11px] text-muted-foreground">
              Signals detected across sources
            </p>
          </div>
          <Link
            to="/opportunities"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-5 py-2 font-normal">Source</th>
                <th className="px-5 py-2 font-normal">Signal</th>
                <th className="px-5 py-2 font-normal">Score</th>
                <th className="px-5 py-2 font-normal">Detected</th>
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {opportunities.slice(0, 5).map((op) => {
                const Icon = sourceIcon[op.source];
                return (
                  <tr key={op.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                          {op.source}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[520px] px-5 py-3">
                      <div className="truncate text-sm text-foreground">{op.title}</div>
                      <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                        {op.snippet}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-16 rounded-full bg-muted">
                          <div
                            className="h-1 rounded-full bg-emerald"
                            style={{ width: `${op.score}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs tabular-nums text-foreground">
                          {op.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {op.detectedAt}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="rounded-md border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                        Assign
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
