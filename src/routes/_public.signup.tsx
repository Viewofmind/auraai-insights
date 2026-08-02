import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/signup")({
  head: () => ({
    meta: [
      { title: "Create a workspace — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Workspace signup shell for AuraAI-CMO. Structure only — registration is not wired to the backend yet.",
      },
      { property: "og:title", content: "Create a workspace — AuraAI · CMO" },
      {
        property: "og:description",
        content: "Self-serve workspace registration shell, pending backend tenant endpoints.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-6">
      <h1 className="text-lg font-semibold tracking-tight text-foreground">Create a workspace</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Placeholder route. Self-serve registration is not implemented — it waits on the backend
        tenant and membership contract.
      </p>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Not connected · no signup endpoint yet
      </div>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        Back to sign in
      </Link>
    </div>
  );
}
