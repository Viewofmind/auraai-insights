import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  component: EmailLayout,
});

const tabs = [
  { to: "/email", label: "Campaigns", exact: true },
  { to: "/email/subscribers", label: "Subscribers & consent", exact: false },
] as const;

function EmailLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
      {/* In-development banner — this area has no send pipeline. */}
      <div className="mb-5 flex flex-col gap-2 rounded-xl border border-dashed border-amber/40 bg-amber/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-2">
          <Construction className="h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber">
            Email marketing — coming soon
          </span>
        </div>
        <p className="text-[12px] leading-snug text-muted-foreground">
          Structure only. No email can be sent from this app: there is no send action anywhere
          in this section, and no subscriber list is active.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-1 rounded-md border border-border/60 bg-card/40 p-1">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
