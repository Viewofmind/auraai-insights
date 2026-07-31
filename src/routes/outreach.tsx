import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import {
  useCreateInfluencer,
  useGenerateOutreachDraft,
  useInfluencers,
  useMarkOutreachSent,
} from "@/lib/api/hooks";
import type { InfluencerContact, OutreachPlatform, OutreachStatus } from "@/lib/api/types";
import {
  Users,
  Plus,
  Loader2,
  Info,
  Sparkles,
  Copy,
  CheckCheck,
  Hand,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/outreach")({
  head: () => ({
    meta: [
      { title: "Influencer Outreach — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Track influencer contacts for InvestSights.in, generate AI-drafted outreach messages for review, and record manually sent messages.",
      },
      { property: "og:title", content: "Influencer Outreach — AuraAI · CMO" },
      {
        property: "og:description",
        content:
          "Contacts, AI-drafted outreach messages for human review, and manual send tracking. Nothing is ever sent automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OutreachPage,
});

const platformLabels: Record<OutreachPlatform, string> = {
  x: "X",
  linkedin: "LinkedIn",
  email: "Email",
  other: "Other",
};

const outreachStatusMeta: Record<OutreachStatus, { label: string; className: string }> = {
  no_draft: { label: "No draft", className: "text-muted-foreground border-border/70 bg-muted/40" },
  draft_generated: { label: "Draft generated", className: "text-cyan border-cyan/40 bg-cyan/10" },
  review_pending: { label: "Review pending", className: "text-amber border-amber/40 bg-amber/10" },
  approved: { label: "Approved", className: "text-emerald border-emerald/40 bg-emerald/10" },
  sent: { label: "Sent manually", className: "text-primary border-primary/40 bg-primary/10" },
};

function OutreachPage() {
  const contacts = useInfluencers();

  return (
    <div className="mx-auto max-w-[1100px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Influencer Outreach"
        title="Contacts & drafted messages"
        description="Drafts route through the same review queue as everything else. This dashboard never sends anything — you send each message yourself from your own account or inbox."
      />

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber/30 bg-amber/[0.07] px-3 py-2 text-[11.5px] text-amber">
        <Hand className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          No automated sending, ever. “Mark as sent” is bookkeeping only — you’ll need to
          copy the message and send it yourself.
        </p>
      </div>

      <NewContactForm />

      <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold tracking-tight">Contacts</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            GET /api/v1/influencers
          </span>
        </header>
        <div className="p-4 sm:p-5">
          <QueryState
            query={contacts}
            emptyIcon={Users}
            emptyTitle="No contacts yet"
            emptyDescription="Add a contact above. Contacts and drafts live in the backend — nothing is stored in this UI."
          >
            {(items) => (
              <ul className="space-y-3">
                {items.map((c) => (
                  <ContactRow key={c.id} contact={c} />
                ))}
              </ul>
            )}
          </QueryState>
        </div>
      </section>
    </div>
  );
}

function ContactRow({ contact }: { contact: InfluencerContact }) {
  const draft = useGenerateOutreachDraft();
  const markSent = useMarkOutreachSent();
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const body = message ?? contact.draft_message ?? "";
  const statusMeta = outreachStatusMeta[contact.outreach_status] ?? outreachStatusMeta.no_draft;
  const error = draft.error ?? markSent.error;

  const copy = async () => {
    if (!body) return;
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <li className="rounded-lg border border-border/50 bg-background/40 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{contact.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
            <span>{platformLabels[contact.platform] ?? contact.platform}</span>
            <span>·</span>
            <span className="normal-case tracking-normal">{contact.handle}</span>
            {contact.sent_at && (
              <>
                <span>·</span>
                <span className="tabular-nums">
                  sent {new Date(contact.sent_at).toISOString().slice(0, 16).replace("T", " ")}
                </span>
              </>
            )}
          </div>
          {contact.notes && (
            <p className="mt-1 text-[11.5px] text-muted-foreground">{contact.notes}</p>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
            statusMeta.className,
          )}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={draft.isPending}
          onClick={() => draft.mutate(contact.id, { onSuccess: (c) => setMessage(c.draft_message) })}
          title="POST /influencers/{id}/outreach/draft"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:opacity-50"
        >
          {draft.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {contact.draft_message ? "Regenerate draft" : "Generate outreach draft"}
        </button>
      </div>

      {body ? (
        <div className="mt-3 rounded-lg border border-border/40 bg-card/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Draft message — editable before you send it
            </span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {body.length} chars
            </span>
          </div>
          <textarea
            aria-label="Draft outreach message"
            value={body}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-md border border-border/60 bg-background/60 p-3 font-mono text-[12px] leading-relaxed focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copy}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 text-xs font-medium transition-colors hover:bg-muted/40"
            >
              {copied ? (
                <CheckCheck className="h-3.5 w-3.5 text-emerald" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy message"}
            </button>
            <button
              type="button"
              disabled={markSent.isPending || contact.outreach_status === "sent"}
              onClick={() => markSent.mutate({ id: contact.id, message: body })}
              title="POST /influencers/{id}/outreach/sent — records only, sends nothing"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {markSent.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Mark as sent
            </button>
            <span className="text-[11.5px] text-muted-foreground">
              You’ll need to send this yourself — this only records that you did.
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[11.5px] text-muted-foreground">
          No draft yet for this contact.
        </p>
      )}

      {error && (
        <p className="mt-2 text-[12px] text-rose-400">
          {error instanceof Error ? error.message : "Request failed."}
        </p>
      )}
    </li>
  );
}

function NewContactForm() {
  const create = useCreateInfluencer();
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<OutreachPlatform>("x");
  const [handle, setHandle] = useState("");
  const [notes, setNotes] = useState("");

  const field =
    "h-9 w-full rounded-md border border-border/70 bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20";
  const label = "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) return;
    create.mutate(
      {
        name: name.trim(),
        platform,
        handle: handle.trim(),
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          setName("");
          setHandle("");
          setNotes("");
        },
      },
    );
  };

  return (
    <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold tracking-tight">Add a contact</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          POST /api/v1/influencers
        </span>
      </header>
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5">
        <div>
          <label htmlFor="c-name" className={label}>
            Name
          </label>
          <input
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ananya Rao"
            className={cn(field, "mt-1")}
            required
          />
        </div>
        <div>
          <label htmlFor="c-platform" className={label}>
            Platform
          </label>
          <select
            id="c-platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as OutreachPlatform)}
            className={cn(field, "mt-1")}
          >
            {(Object.keys(platformLabels) as OutreachPlatform[]).map((p) => (
              <option key={p} value={p}>
                {platformLabels[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="c-handle" className={label}>
            Handle or email
          </label>
          <input
            id="c-handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@handle or name@example.com"
            className={cn(field, "mt-1 font-mono text-[12.5px]")}
            required
          />
        </div>
        <div>
          <label htmlFor="c-notes" className={label}>
            Notes
          </label>
          <input
            id="c-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context, past interactions, angle"
            className={cn(field, "mt-1")}
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={create.isPending || !name.trim() || !handle.trim()}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {create.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Add contact
          </button>
        </div>

        <p className="col-span-full flex items-start gap-2 text-[11.5px] text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Contacts are stored by the backend. Until it responds, this form reports the error
          rather than pretending the contact was saved.
        </p>

        {create.isError && (
          <p className="col-span-full text-[12px] text-rose-400">
            {create.error instanceof Error ? create.error.message : "Request failed."}
          </p>
        )}
        {create.isSuccess && (
          <p className="col-span-full text-[12px] text-emerald-400">
            Added “{create.data.name}”.
          </p>
        )}
      </form>
    </section>
  );
}
