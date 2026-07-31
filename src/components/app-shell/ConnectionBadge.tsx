import { useHealth } from "@/lib/api/hooks";
import { isApiConfigured, API_BASE_URL } from "@/lib/api/config";
import { isNotConnectedError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/**
 * Live connection badge driven by GET /api/v1/health.
 * Nothing is hardcoded: the label reflects the real request outcome, and any
 * status/version fields the backend returns are shown verbatim.
 */
export function ConnectionBadge() {
  const health = useHealth();

  let dot = "bg-amber";
  let text = "text-amber";
  let label: string;

  if (!isApiConfigured()) {
    label = "No backend configured";
  } else if (health.isPending) {
    dot = "bg-muted-foreground";
    text = "text-muted-foreground";
    label = "Checking…";
  } else if (health.isError) {
    dot = "bg-rose-400";
    text = "text-rose-300";
    label = isNotConnectedError(health.error) ? "Disconnected" : "Health check failed";
  } else {
    const status = health.data?.status ?? "ok";
    const version = health.data?.version;
    const ok = status === "ok";
    dot = ok ? "bg-emerald" : "bg-amber";
    text = ok ? "text-emerald" : "text-amber";
    label = version ? `${status} · v${version}` : status;
  }

  return (
    <div
      title={isApiConfigured() ? API_BASE_URL : "VITE_API_BASE_URL is not set"}
      className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-2.5 py-1 sm:flex"
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", text)}>
        {label}
      </span>
    </div>
  );
}
