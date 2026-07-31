import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { useAuditLog } from "@/lib/api/hooks";
import { ScrollText, Search } from "lucide-react";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Log — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Compliance-facing audit trail for InvestSights.in: actor, action, status transitions and timestamps.",
      },
      { property: "og:title", content: "Audit Log — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Searchable record of every actor, action and state transition.",
      },
    ],
  }),
  component: AuditLogPage,
});

function AuditLogPage() {
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");
  const log = useAuditLog();

  const actors = useMemo(
    () => Array.from(new Set((log.data ?? []).map((e) => e.actor))).sort(),
    [log.data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const data = (log.data ?? []).filter((e) => {
      if (actor !== "all" && e.actor !== actor) return false;
      if (!q) return true;
      return `${e.actor} ${e.action} ${e.from_status ?? ""} ${e.to_status ?? ""} ${e.content_id ?? ""}`
        .toLowerCase()
        .includes(q);
    });
    return { ...log, data } as typeof log;
  }, [log, query, actor]);

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Audit log"
        title="Audit trail"
        description="Every actor, action and state transition, in order. Plain by design — this screen is for compliance review, not presentation."
      />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            aria-label="Search audit log by actor, action, status or content id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actor, action, status, content id"
            className="h-9 w-full rounded-md border border-border/70 bg-card/60 pl-9 pr-3 font-mono text-[12.5px] placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          aria-label="Filter audit log by actor"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          className="h-9 rounded-md border border-border/70 bg-card/60 px-2 font-mono text-[12px] text-foreground focus:border-primary/60 focus:outline-none"
        >
          <option value="all">All actors</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <section className="mt-4 rounded-lg border border-border/60 bg-card/40">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-2.5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
            Entries
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            GET /api/v1/audit-log
          </span>
        </header>

        <div className="p-3">
          <QueryState
            query={filtered}
            rows={8}
            emptyIcon={ScrollText}
            emptyTitle="No audit entries"
            emptyDescription="Entries are written by the backend on every state transition. Nothing recorded yet."
          >
            {(entries) => (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-[12px]">
                  <thead>
                    <tr className="text-left uppercase tracking-[0.12em] text-muted-foreground">
                      <th className="border-b border-border/50 px-3 py-2 font-normal">Timestamp</th>
                      <th className="border-b border-border/50 px-3 py-2 font-normal">Actor</th>
                      <th className="border-b border-border/50 px-3 py-2 font-normal">Action</th>
                      <th className="border-b border-border/50 px-3 py-2 font-normal">From</th>
                      <th className="border-b border-border/50 px-3 py-2 font-normal">To</th>
                      <th className="border-b border-border/50 px-3 py-2 font-normal">Content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} className="odd:bg-background/30 hover:bg-muted/30">
                        <td className="whitespace-nowrap border-b border-border/30 px-3 py-1.5 tabular-nums text-muted-foreground">
                          {e.timestamp}
                        </td>
                        <td className="border-b border-border/30 px-3 py-1.5 text-foreground">
                          {e.actor}
                        </td>
                        <td className="border-b border-border/30 px-3 py-1.5 text-foreground">
                          {e.action}
                        </td>
                        <td className="border-b border-border/30 px-3 py-1.5 text-muted-foreground">
                          {e.from_status ?? "—"}
                        </td>
                        <td className="border-b border-border/30 px-3 py-1.5 text-foreground">
                          {e.to_status ?? "—"}
                        </td>
                        <td className="border-b border-border/30 px-3 py-1.5 text-muted-foreground">
                          {e.content_id ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </QueryState>
        </div>
      </section>
    </div>
  );
}
