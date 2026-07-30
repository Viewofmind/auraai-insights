import { Bell, Search, Command, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents, drafts, opportunities…"
            className="h-9 w-full rounded-md border border-border/70 bg-card/60 pl-9 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 flex h-5 -translate-y-1/2 items-center gap-0.5 rounded border border-border/70 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-2.5 py-1 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
            Disconnected · demo data
          </span>
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-card/60 text-muted-foreground transition-colors hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/60 text-muted-foreground">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
