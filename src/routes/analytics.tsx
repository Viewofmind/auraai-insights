import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsLayout,
});

const tabs = [
  { to: "/analytics", label: "Overview", exact: true },
  { to: "/analytics/seo", label: "SEO", exact: false },
  { to: "/analytics/technical", label: "Technical", exact: false },
] as const;

function AnalyticsLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <div className="flex w-fit items-center gap-1 rounded-md border border-border/60 bg-card/40 p-1">
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
      </div>
      <Outlet />
    </div>
  );
}
