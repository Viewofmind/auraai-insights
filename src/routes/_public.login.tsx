import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, roleLabel } from "@/lib/auth/AuthContext";
import { Activity, Info, Loader2, ShieldAlert, WifiOff } from "lucide-react";

export const Route = createFileRoute("/_public/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Sign in to the AuraAI-CMO workspace. Identity, role and tenant are asserted by the backend via /auth/me.",
      },
      { property: "og:title", content: "Sign in — AuraAI · CMO" },
      {
        property: "og:description",
        content: "AuraAI-CMO sign-in — server-asserted identity, role and tenant.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, status, error, token, setToken, signOut, tenantLabel, refresh } = useAuth();
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState("");

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center p-4 sm:p-6">
      <div className="rounded-xl border border-border/60 bg-card/60 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald to-cyan ring-1 ring-emerald/30">
            <Activity className="h-4 w-4 text-background" strokeWidth={2.75} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">AuraAI · CMO</div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
              {tenantLabel ?? "Workspace"}
            </div>
          </div>
        </div>

        <h1 className="mt-6 text-lg font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 flex items-start gap-2 text-[11.5px] text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Paste your backend access token. It is sent as
          <span className="font-mono"> Authorization: Bearer &lt;token&gt;</span>, and your
          identity, role and tenant are then read from{" "}
          <span className="font-mono">GET /auth/me</span> — never chosen here.
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <label
              htmlFor="token"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              Access token (Bearer)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="token"
                type="password"
                autoComplete="off"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder={token ? "token set — paste to replace" : "paste backend access token"}
                className="h-9 flex-1 rounded-md border border-border/70 bg-background/60 px-3 font-mono text-[12.5px] placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => {
                  setToken(accessToken.trim() || null);
                  setAccessToken("");
                }}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign in
              </button>
            </div>
          </div>

          <IdentityPanel />

          <div className="flex gap-2">
            <button
              onClick={() => navigate({ to: "/" })}
              disabled={status !== "authenticated"}
              className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              Continue to dashboard
            </button>
            {status === "not-connected" || status === "error" ? (
              <button
                onClick={refresh}
                className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm font-medium hover:bg-muted/40"
              >
                Retry
              </button>
            ) : null}
            {token ? (
              <button
                onClick={signOut}
                className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm font-medium hover:bg-muted/40"
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  function IdentityPanel() {
    if (status === "anonymous") {
      return (
        <p className="rounded-lg border border-border/50 bg-background/40 p-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
          Not signed in — no token set
        </p>
      );
    }

    if (status === "loading") {
      return (
        <p className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 p-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Resolving identity from /auth/me…
        </p>
      );
    }

    if (status === "not-connected") {
      return (
        <p className="flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 p-3 text-[11.5px] text-amber">
          <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Backend not reachable — identity cannot be verified. No data is shown until
          /auth/me responds.
        </p>
      );
    }

    if (status === "error") {
      return (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-[11.5px] text-destructive">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error?.message ?? "Token rejected by /auth/me."}
        </p>
      );
    }

    return (
      <div className="rounded-lg border border-border/50 bg-background/40 p-3 font-mono text-[12px]">
        <div className="text-foreground">{user!.email}</div>
        <div className="mt-0.5 uppercase tracking-[0.12em] text-muted-foreground">
          {roleLabel(user!.role)}
        </div>
        <div className="mt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
          Tenant · {tenantLabel}
        </div>
      </div>
    );
  }
}
