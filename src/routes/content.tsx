import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { drafts, type Draft, type DraftStatus } from "@/lib/mock/drafts";
import { FileText, Check, MessageSquareWarning, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Content Studio — AuraAI · CMO" },
      {
        name: "description",
        content: "Generated drafts, review workflow, and multi-channel publishing.",
      },
    ],
  }),
  component: ContentStudioPage,
});

const statusStyles: Record<DraftStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "text-muted-foreground bg-muted" },
  in_review: { label: "In review", className: "text-amber bg-amber/10" },
  approved: { label: "Approved", className: "text-emerald bg-emerald/10" },
  published: { label: "Published", className: "text-cyan bg-cyan/10" },
};

function ContentStudioPage() {
  const [selectedId, setSelectedId] = useState<string>(drafts[0]?.id ?? "");
  const [channel, setChannel] = useState<string>("all");
  const filtered = drafts.filter((d) => channel === "all" || d.channel === channel);
  const selected: Draft | undefined = drafts.find((d) => d.id === selectedId);

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Content Studio"
        title="Drafts & approval workflow"
        description="Every piece of content the agents ship, in one review queue."
      />

      <div className="mt-6 flex items-center gap-1 overflow-x-auto rounded-lg border border-border/60 bg-card/40 p-1 backdrop-blur-sm">
        {[
          { id: "all", label: "All channels" },
          { id: "blog", label: "Blog" },
          { id: "linkedin", label: "LinkedIn" },
          { id: "x", label: "X" },
          { id: "reddit", label: "Reddit" },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setChannel(c.id)}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              channel === c.id
                ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={FileText}
            title="No drafts yet"
            description="Spin up the Content Writer Agent to generate your first drafts across channels."
            action={
              <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                Run Content Writer
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* List */}
          <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm">
            <div className="border-b border-border/40 px-4 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {filtered.length} drafts
              </span>
            </div>
            <ul className="max-h-[70vh] overflow-y-auto divide-y divide-border/40">
              {filtered.map((d) => {
                const s = statusStyles[d.status];
                return (
                  <li key={d.id}>
                    <button
                      onClick={() => setSelectedId(d.id)}
                      className={cn(
                        "block w-full px-4 py-3 text-left transition-colors",
                        selectedId === d.id ? "bg-muted/40" : "hover:bg-muted/20",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 text-sm font-medium">
                            {d.title}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-mono uppercase tracking-[0.1em]">
                              {d.channel}
                            </span>
                            <span>·</span>
                            <span>{d.agent}</span>
                            <span>·</span>
                            <span>{d.updatedAt}</span>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
                            s.className,
                          )}
                        >
                          {s.label}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Preview */}
          {selected && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px]">
              <article className="rounded-lg border border-border/60 bg-card/50 p-6">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
                      statusStyles[selected.status].className,
                    )}
                  >
                    {statusStyles[selected.status].label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {selected.channel} · {selected.wordCount} words
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  {selected.title}
                </h2>
                <div className="mt-5 space-y-4 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground/90">
                  {selected.body}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                    <MessageSquareWarning className="h-3.5 w-3.5" /> Request changes
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-1.5 text-xs font-medium text-emerald transition-colors hover:bg-emerald/20">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    <Send className="h-3.5 w-3.5" /> Publish
                  </button>
                </div>
              </article>

              <aside className="rounded-lg border border-border/60 bg-card/50 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Metadata
                </div>
                <dl className="mt-3 space-y-3 text-xs">
                  <MetaRow label="Channel" value={selected.channel} />
                  <MetaRow label="Source agent" value={selected.agent} />
                  <MetaRow label="Target keyword" value={selected.targetKeyword} />
                  <MetaRow label="Word count" value={selected.wordCount.toLocaleString()} mono />
                  <MetaRow label="Updated" value={selected.updatedAt} mono />
                </dl>
              </aside>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("mt-0.5 text-foreground", mono && "font-mono tabular-nums")}>
        {value}
      </dd>
    </div>
  );
}
