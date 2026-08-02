import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_platform")({
  component: PlatformLayout,
});

function PlatformLayout() {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-3 sm:px-6">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Platform console · SocialCoffee DigiTech
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
