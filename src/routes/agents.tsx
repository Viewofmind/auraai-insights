import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { AgentCard } from "@/components/agents/AgentCard";
import { EmptyState } from "@/components/common/EmptyState";
import { agents, type AgentStatus } from "@/lib/mock/agents";
import { Search, Bot, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents Hub — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Every autonomous marketing agent for InvestSights.in in one grid — SEO, GEO, Content, Reddit, X, LinkedIn, Technical SEO.",
      },
    ],
  }),
  component: AgentsHubPage,
});

type Filter = "all" | AgentStatus;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "paused", label: "Paused" },
  { id: "error", label: "Error" },
];

function AgentsHubPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = agents.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (query && !`${a.name} ${a.role}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  const counts = {
    all: agents.length,
    live: agents.filter((a) => a.status === "live").length,
    paused: agents.filter((a) => a.status === "paused").length,
    error: agents.filter((a) => a.status === "error").length,
  };

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Agents Hub"
        title="Autonomous marketing agents"
        description="Seven agents working the InvestSights.in growth surface. Watch signals, ship drafts, own the answer engines."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            New agent
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-border/60 bg-card/40 p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="font-mono text-[10px] tabular-nums opacity-70">
                {counts[f.id]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter agents"
            className="h-9 w-full rounded-md border border-border/70 bg-card/60 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a, i) => (
            <div
              key={a.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-in-up"
            >
              <AgentCard agent={a} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={Bot}
            title="No agents match your filter"
            description="Try clearing the search or switching to All to see every configured agent."
            action={
              <button
                onClick={() => {
                  setFilter("all");
                  setQuery("");
                }}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Clear filters
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
