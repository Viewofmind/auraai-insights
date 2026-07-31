import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, KeyRound, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hard confirmation gate for a destructive credential write.
 *
 * Same discipline as PublishConfirmDialog:
 *  - names exactly what is being replaced or removed
 *  - the action button is specific ("Overwrite X key" / "Clear X key")
 *  - closes on submit; a failure is reported by the caller and requires
 *    re-opening this dialog — no silent retry, no polling
 *  - the secret itself is never rendered, only its masked preview
 */
export function CredentialConfirmDialog({
  intent,
  providerLabel,
  maskedValue,
  lastUpdated,
  disabled,
  pending,
  trigger,
  onConfirm,
}: {
  intent: "overwrite" | "clear";
  providerLabel: string;
  maskedValue: string | null;
  lastUpdated: string | null;
  disabled?: boolean;
  pending?: boolean;
  trigger?: ReactNode;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const clearing = intent === "clear";

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors disabled:opacity-50",
          clearing
            ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
            : "border-amber/40 bg-amber/10 text-amber hover:bg-amber/20",
        )}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : clearing ? (
          <Trash2 className="h-3.5 w-3.5" />
        ) : (
          <KeyRound className="h-3.5 w-3.5" />
        )}
        {trigger ?? (clearing ? "Clear" : "Overwrite")}
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber" />
              {clearing
                ? `Clear the stored ${providerLabel} credential?`
                : `Overwrite the stored ${providerLabel} credential?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {clearing
                ? `Any feature that uses ${providerLabel} stops working immediately. The stored value cannot be recovered from this dashboard — you would have to paste it again.`
                : `The existing ${providerLabel} value is replaced server-side and cannot be recovered from this dashboard. Anything still using the old key stops working immediately.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-lg border border-border/60 bg-background/60 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Currently stored
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{providerLabel}</span>
              <span className="font-mono text-[12px] text-muted-foreground">
                {maskedValue ?? "value not reported by backend"}
              </span>
            </div>
            <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {lastUpdated ? `last updated ${lastUpdated}` : "last update time unknown"}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors",
                clearing
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {clearing ? (
                <Trash2 className="h-3.5 w-3.5" />
              ) : (
                <KeyRound className="h-3.5 w-3.5" />
              )}
              {clearing ? `Clear ${providerLabel} key` : `Overwrite ${providerLabel} key`}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
