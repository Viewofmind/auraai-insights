import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_platform/platform")({
  head: () => ({
    meta: [
      { title: "Platform console — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Platform-owner console shell for SocialCoffee DigiTech oversight. Structure only — no tenant data is connected yet.",
      },
      { property: "og:title", content: "Platform console — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Oversight console shell for tenant list, usage, and billing status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlatformHome,
});

function PlatformHome() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Platform console</h1>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Shell only. Tenant list, usage stats, and billing status land here once the backend tenant
        foundation ships. No tenant data is connected yet.
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-border/60 bg-card/40 p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Not connected · no data yet
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          This console uses its own isolated data layer and must not import the tenant product API
          client.
        </p>
      </div>
    </div>
  );
}
