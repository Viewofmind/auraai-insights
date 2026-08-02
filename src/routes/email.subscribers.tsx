import { createFileRoute } from "@tanstack/react-router";
import { Users, Info, MailCheck } from "lucide-react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { useEmailSubscribers } from "@/lib/api/hooks";

export const Route = createFileRoute("/email/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers & Consent — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Consent model for InvestSights.in email: double opt-in, confirmation and subscription timestamps. No subscribers yet — sending is not active.",
      },
      { property: "og:title", content: "Subscribers & Consent — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Double opt-in consent structure — display only, no import flow.",
      },
    ],
  }),
  component: SubscribersPage,
});

const fields = [
  { name: "email", detail: "Subscriber address. Unique per list." },
  { name: "double_opt_in", detail: "Boolean. Must be true before an address is ever mailable." },
  { name: "consent_source", detail: "Where the opt-in was captured (form, landing page, import)." },
  { name: "subscribed_at", detail: "Timestamp the opt-in was submitted." },
  { name: "confirmed_at", detail: "Timestamp the confirmation link was clicked." },
  { name: "unsubscribed_at", detail: "Timestamp of withdrawal, when present." },
];

function SubscribersPage() {
  const subscribers = useEmailSubscribers();

  return (
    <div>
      <PageHeader
        eyebrow="Email marketing · structure only"
        title="Subscribers & consent"
        description="The consent model this feature area will use. Display structure only — there is no import flow and no active list."
      />

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-border/50 bg-card/30 px-3 py-2 text-[11.5px] text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p>
          Double opt-in is the only supported consent model: an address is never mailable until
          <span className="font-mono"> confirmed_at</span> is set. No counts are shown anywhere
          because no subscriber data exists.
        </p>
      </div>

      <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <MailCheck className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            Consent model
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Double opt-in
          </span>
        </header>
        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 sm:p-4">
          {fields.map((f) => (
            <div
              key={f.name}
              className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5"
            >
              <div className="font-mono text-[11px] text-foreground">{f.name}</div>
              <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border/60 bg-card/50">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold tracking-tight">Subscribers</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            No import flow yet
          </span>
        </header>
        <div className="p-3 sm:p-4">
          <QueryState
            query={subscribers}
            emptyIcon={Users}
            emptyTitle="No subscribers yet — sending is not active"
            emptyDescription="No consent records have come back from the backend. Importing and sending are both out of scope today."
          >
            {(data) => (
              <div
                role="region"
                aria-label="Subscribers table"
                tabIndex={0}
                className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <table className="w-full min-w-[720px] text-left text-[12px]">
                  <thead className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Double opt-in</th>
                      <th className="px-3 py-2 font-medium">Subscribed</th>
                      <th className="px-3 py-2 font-medium">Confirmed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((s) => (
                      <tr key={s.id} className="border-b border-border/30">
                        <td className="px-3 py-2 text-foreground">{s.email}</td>
                        <td className="px-3 py-2 text-muted-foreground">{s.status ?? "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {s.double_opt_in === true
                            ? "Confirmed"
                            : s.double_opt_in === false
                              ? "Not confirmed"
                              : "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">
                          {s.subscribed_at ?? "—"}
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">
                          {s.confirmed_at ?? "—"}
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
