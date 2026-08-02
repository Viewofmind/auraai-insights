import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald to-cyan ring-1 ring-emerald/30">
          <Activity className="h-4 w-4 text-background" strokeWidth={2.75} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-foreground">AuraAI · CMO</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Workspace access
          </div>
        </div>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
