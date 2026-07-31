import { cn } from "@/lib/utils";
import type { GeoSeverity, GeoVerdict, GeoEngine } from "@/lib/api/types";

const severityStyles: Record<GeoSeverity, { label: string; className: string }> = {
  critical: { label: "Critical", className: "text-rose border-rose/40 bg-rose/10" },
  high: { label: "High", className: "text-amber border-amber/40 bg-amber/10" },
  medium: { label: "Medium", className: "text-cyan border-cyan/40 bg-cyan/10" },
  low: { label: "Low", className: "text-muted-foreground border-border/70 bg-muted/40" },
  ok: { label: "OK", className: "text-emerald border-emerald/40 bg-emerald/10" },
};

export const severityOrder: GeoSeverity[] = ["critical", "high", "medium", "low", "ok"];

export function SeverityBadge({
  severity,
  className,
}: {
  severity: GeoSeverity;
  className?: string;
}) {
  const s = severityStyles[severity] ?? severityStyles.low;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em]",
        s.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

const verdictStyles: Record<GeoVerdict, { label: string; className: string }> = {
  strong: { label: "Strong", className: "text-emerald border-emerald/40 bg-emerald/10" },
  cited: { label: "Cited", className: "text-cyan border-cyan/40 bg-cyan/10" },
  mentioned_only: { label: "Mentioned only", className: "text-amber border-amber/40 bg-amber/10" },
  invisible: { label: "Invisible", className: "text-rose border-rose/40 bg-rose/10" },
};

export function VerdictBadge({ verdict }: { verdict: GeoVerdict }) {
  const v = verdictStyles[verdict] ?? {
    label: verdict,
    className: "text-muted-foreground border-border/70 bg-muted/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em]",
        v.className,
      )}
    >
      {v.label}
    </span>
  );
}

export const engineLabels: Record<GeoEngine, string> = {
  openai: "OpenAI · ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  claude: "Claude",
};

export function engineLabel(engine: string): string {
  return engineLabels[engine as GeoEngine] ?? engine;
}
