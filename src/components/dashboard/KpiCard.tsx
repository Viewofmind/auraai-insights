import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-24px_color-mix(in_oklab,var(--primary)_50%,transparent)]">
      {/* accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/[0.08] blur-3xl transition-opacity duration-500 group-hover:bg-primary/[0.16]" />
      {/* top accent bar */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />

      <div className="relative flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/60 text-muted-foreground transition-colors group-hover:text-primary">
            {icon}
          </div>
        )}
      </div>
      <div className="relative mt-4 flex items-baseline gap-2">
        <span className="font-mono text-[32px] font-semibold leading-none tabular-nums tracking-tight text-foreground">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums",
              delta.positive
                ? "bg-emerald/10 text-emerald ring-1 ring-inset ring-emerald/20"
                : "bg-rose/10 text-rose ring-1 ring-inset ring-rose/20",
            )}
          >
            {delta.positive ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5" />
            )}
            {delta.value}
          </span>
        )}
      </div>
      {hint && (
        <div className="relative mt-2 text-[11.5px] text-muted-foreground/90">{hint}</div>
      )}
    </div>
  );
}
