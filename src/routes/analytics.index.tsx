import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  publishedByChannel,
  opportunityVolume,
  agentSuccess,
  topPieces,
} from "@/lib/mock/analytics";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics/")({
  head: () => ({
    meta: [
      { title: "Performance Analytics — AuraAI · CMO" },
      {
        name: "description",
        content: "Performance across agents, channels, and opportunity sources.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const ranges = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
];

function AnalyticsPage() {
  const [range, setRange] = useState("30d");

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <PageHeader
        eyebrow="Analytics"
        title="Performance"
        description="No analytics source is connected yet, so every metric below is empty."
        actions={
          <div className="flex items-center gap-1 rounded-md border border-border/60 bg-card/40 p-1">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  range === r.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pieces published" value="0" hint="No data source connected" />
        <KpiCard label="Opportunities acted on" value="0" hint="No data source connected" />
        <KpiCard label="Avg. agent success" value="—" hint="No agent runs recorded" />
        <KpiCard label="Est. reach · 30d" value="—" hint="No analytics connection" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Pieces published by channel" subtitle="No data yet">
          {publishedByChannel.length === 0 ? <NoData /> : <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={publishedByChannel}>
              <defs>
                <linearGradient id="blog" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="linkedin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" hide />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} width={24} />
              <Tooltip content={<TT />} />
              <Area type="monotone" dataKey="blog" stroke="var(--emerald)" strokeWidth={1.5} fill="url(#blog)" />
              <Area type="monotone" dataKey="linkedin" stroke="var(--cyan)" strokeWidth={1.5} fill="url(#linkedin)" />
              <Area type="monotone" dataKey="x" stroke="var(--amber)" strokeWidth={1.5} fill="none" />
            </AreaChart>
          </ResponsiveContainer>}
        </ChartCard>

        <ChartCard title="Opportunity volume by source" subtitle="No data yet">
          {opportunityVolume.length === 0 ? <NoData /> : <ResponsiveContainer width="100%" height={220}>
            <BarChart data={opportunityVolume}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="source" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} width={24} />
              <Tooltip content={<TT />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
              <Bar dataKey="count" fill="var(--emerald)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>}
        </ChartCard>

        <ChartCard title="Agent success rate" subtitle="No data yet" className="lg:col-span-2">
          {agentSuccess.length === 0 ? <NoData /> : <ResponsiveContainer width="100%" height={220}>
            <LineChart data={agentSuccess}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} domain={[80, 100]} tickLine={false} axisLine={false} width={30} />
              <Tooltip content={<TT />} />
              <Line type="monotone" dataKey="rate" stroke="var(--emerald)" strokeWidth={2} dot={{ r: 2, fill: "var(--emerald)" }} />
            </LineChart>
          </ResponsiveContainer>}
        </ChartCard>
      </div>

      {/* Top pieces */}
      <section className="mt-6 rounded-lg border border-border/60 bg-card/50">
        <header className="border-b border-border/40 px-5 py-3">
          <h2 className="text-sm font-semibold tracking-tight">Top-performing pieces</h2>
          <p className="text-[11px] text-muted-foreground">No data yet</p>
        </header>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Top-performing pieces table, scrollable">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-5 py-2 font-normal">Title</th>
              <th className="px-5 py-2 font-normal">Channel</th>
              <th className="px-5 py-2 font-normal text-right">Views</th>
              <th className="px-5 py-2 font-normal text-right">CTR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {topPieces.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[12px] text-muted-foreground">
                  No published pieces tracked — connect an analytics source to populate this table.
                </td>
              </tr>
            )}
            {topPieces.map((p) => (
              <tr key={p.title} className="hover:bg-muted/30">
                <td className="px-5 py-3">{p.title}</td>
                <td className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  {p.channel}
                </td>
                <td className="px-5 py-3 text-right font-mono tabular-nums">
                  {p.views.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right font-mono tabular-nums text-emerald">
                  {p.ctr}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}

function NoData() {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-border/60">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        No data yet
      </span>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/60 bg-card/50 p-5", className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function TT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border/70 bg-popover/95 px-3 py-2 shadow-xl backdrop-blur-md">
      {label && (
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
      )}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.dataKey}</span>
          <span className="ml-auto font-mono tabular-nums text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
