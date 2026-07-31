import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/geo")({
  component: GeoLayout,
});

const tabs = [
  { to: "/geo", label: "Readiness", exact: true },
  { to: "/geo/citations", label: "Citation check", exact: false },
] as const;

function GeoLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
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
