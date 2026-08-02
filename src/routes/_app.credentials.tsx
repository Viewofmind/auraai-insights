import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app-shell/PageHeader";
import { NotConnected } from "@/components/common/QueryState";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { CredentialConfirmDialog } from "@/components/admin/CredentialConfirmDialog";
import {
  useAdminCredentials,
  useClearCredential,
  useSaveCredential,
} from "@/lib/api/hooks";
import { isNotConnectedError } from "@/lib/api/client";
import type { AdminCredential, CredentialProvider } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { AlertTriangle, KeyRound, Loader2, Lock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/credentials")({
  head: () => ({
    meta: [
      { title: "API Credentials — AuraAI · CMO" },
      {
        name: "description",
        content:
          "Admin-only credential vault for AuraAI-CMO: add, replace or clear X, LinkedIn and Perplexity API keys. Stored values are never displayed.",
      },
      { property: "og:title", content: "API Credentials — AuraAI · CMO" },
      {
        property: "og:description",
        content:
          "Admin-only, write-only API credential management for the AuraAI-CMO workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CredentialsPage,
});

const providerMeta: Record<CredentialProvider, { label: string; blurb: string }> = {
  x: { label: "X (Twitter)", blurb: "API key/secret used to publish short-form posts." },
  linkedin: { label: "LinkedIn", blurb: "OAuth app credentials for LinkedIn publishing." },
  perplexity: { label: "Perplexity", blurb: "Used by GEO citation checks." },
  openai: { label: "OpenAI", blurb: "Drafting and GEO citation checks via ChatGPT." },
  anthropic: { label: "Anthropic", blurb: "Claude-based drafting and citation checks." },
  gemini: { label: "Google Gemini", blurb: "Gemini-based citation checks." },
};

const providerOrder = Object.keys(providerMeta) as CredentialProvider[];

function CredentialsPage() {
  const { user } = useAuth();
  const credentials = useAdminCredentials();

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-[900px] p-4 sm:p-6 lg:p-8">
        <PageHeader
          eyebrow="Admin"
          title="API credentials"
          description="Restricted screen."
        />
        <div className="mt-6">
          <EmptyState
            icon={Lock}
            title="Admin access required"
            description={
              user
                ? `You are signed in as ${user.email} (${user.role}), which is not the admin role. Roles are assigned by the backend — sign in with an admin account to manage credentials.`
                : "Sign in with the admin role to view and manage API credentials."
            }
            action={
              <Link
                to="/login"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to sign in
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const byProvider = new Map((credentials.data ?? []).map((c) => [c.provider, c]));

  return (
    <div className="mx-auto max-w-[900px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Admin"
        title="API credentials"
        description="Write-only vault. A saved value is never shown again — only a masked preview and its last-updated info come back from the backend."
      />

      <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber/30 bg-amber/[0.07] px-3 py-2 text-[11.5px] text-amber">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        These are live third-party secrets. Values are sent once to{" "}
        <span className="font-mono">PUT /api/v1/admin/credentials/&#123;provider&#125;</span> and
        held server-side; overwriting or clearing takes effect immediately and cannot be
        undone from this dashboard.
      </p>

      {credentials.isPending ? (
        <div className="mt-6 space-y-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : credentials.isError && isNotConnectedError(credentials.error) ? (
        <div className="mt-6">
          <NotConnected />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {credentials.isError && (
            <p className="flex items-start gap-2 rounded-lg border border-amber/30 bg-amber/[0.07] px-3 py-2 text-[11.5px] text-amber">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Credential status is unavailable:{" "}
              {credentials.error instanceof Error ? credentials.error.message : "unknown error"}.
              Existing values were not changed.
            </p>
          )}
          {providerOrder.map((provider) => (
            <CredentialRow
              key={provider}
              provider={provider}
              credential={byProvider.get(provider) ?? null}
              statusUnknown={credentials.isError}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CredentialRow({
  provider,
  credential,
  statusUnknown,
}: {
  provider: CredentialProvider;
  credential: AdminCredential | null;
  statusUnknown: boolean;
}) {
  const meta = providerMeta[provider];
  const save = useSaveCredential();
  const clear = useClearCredential();
  const [value, setValue] = useState("");

  const configured = credential?.configured ?? false;
  const trimmed = value.trim();

  const submit = () => {
    if (!trimmed) return;
    save.mutate(
      { provider, value: trimmed },
      { onSuccess: () => setValue("") },
    );
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{meta.label}</div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">{meta.blurb}</div>
          <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            {statusUnknown
              ? "status unknown"
              : configured
                ? `stored ${credential?.masked_value ?? "••••"}${
                    credential?.last_updated_at
                      ? ` · updated ${credential.last_updated_at}`
                      : ""
                  }${credential?.updated_by ? ` · by ${credential.updated_by}` : ""}`
                : "not set"}
          </div>
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
            configured
              ? "border-emerald/40 bg-emerald/10 text-emerald"
              : "border-border/70 bg-muted/40 text-muted-foreground",
          )}
        >
          {statusUnknown ? "Unknown" : configured ? "Configured" : "Not set"}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="password"
          aria-label={`New value for ${meta.label} credential`}
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={configured ? "paste a new value to replace" : "paste value"}
          className="h-9 flex-1 rounded-md border border-border/70 bg-background/60 px-2.5 font-mono text-[12.5px] placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
        />

        {configured ? (
          <CredentialConfirmDialog
            intent="overwrite"
            providerLabel={meta.label}
            maskedValue={credential?.masked_value ?? null}
            lastUpdated={credential?.last_updated_at ?? null}
            disabled={!trimmed || save.isPending}
            pending={save.isPending}
            trigger="Replace value"
            onConfirm={submit}
          />
        ) : (
          <button
            type="button"
            disabled={!trimmed || save.isPending}
            onClick={submit}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {save.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <KeyRound className="h-3.5 w-3.5" />
            )}
            Save value
          </button>
        )}

        {configured && (
          <CredentialConfirmDialog
            intent="clear"
            providerLabel={meta.label}
            maskedValue={credential?.masked_value ?? null}
            lastUpdated={credential?.last_updated_at ?? null}
            disabled={clear.isPending}
            pending={clear.isPending}
            trigger="Clear"
            onConfirm={() => clear.mutate(provider)}
          />
        )}
      </div>

      {(save.isError || clear.isError) && (
        <p className="mt-2 flex items-start gap-2 rounded-lg border border-amber/30 bg-amber/[0.07] px-3 py-2 text-[11.5px] text-amber">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {save.isError
            ? "Saving failed — nothing was stored. Re-confirm to try again."
            : "Clearing failed — the stored value is unchanged. Re-confirm to try again."}{" "}
          <span className="font-mono">
            {((save.error ?? clear.error) as Error | undefined)?.message}
          </span>
        </p>
      )}

      {save.isSuccess && !trimmed && (
        <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-emerald">
          value stored — it will never be displayed again
        </p>
      )}
    </div>
  );
}
