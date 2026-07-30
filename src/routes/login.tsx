import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, roleLabels, type AppRole } from "@/lib/auth/AuthContext";
import { Activity, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Sign-in shell for the AuraAI-CMO workspace. Local stub only — no credentials are transmitted or verified.",
      },
      { property: "og:title", content: "Sign in — AuraAI · CMO" },
      {
        property: "og:description",
        content: "AuraAI-CMO sign-in shell, pending backend authentication.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("editor");

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
              InvestSights.in
            </div>
          </div>
        </div>

        <h1 className="mt-6 text-lg font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 flex items-start gap-2 text-[11.5px] text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Stub only. Nothing is sent anywhere and no credential is checked — this screen
          exists so the shell and role-scoped views can be reviewed before backend auth
          lands.
        </p>

        {user ? (
          <div className="mt-6 space-y-3">
            <div className="rounded-lg border border-border/50 bg-background/40 p-3 font-mono text-[12px]">
              <div className="text-foreground">{user.email}</div>
              <div className="mt-0.5 uppercase tracking-[0.12em] text-muted-foreground">
                {roleLabels[user.role]}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate({ to: "/" })}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Continue to dashboard
              </button>
              <button
                onClick={signOut}
                className="rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm font-medium hover:bg-muted/40"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              signIn(email.trim() || "user@investsights.in", role);
              navigate({ to: "/" });
            }}
          >
            <div>
              <label
                htmlFor="email"
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@investsights.in"
                className="mt-1 h-9 w-full rounded-md border border-border/70 bg-background/60 px-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Role context
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-card/40 p-1">
                {(Object.keys(roleLabels) as AppRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                      role === r
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
