import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { channelMeta } from "@/components/channels/ChannelBadge";
import type { PublishChannel } from "@/lib/api/types";
import { AlertTriangle, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hard confirmation gate for a real, public, hard-to-undo external post.
 *
 * Deliberately stronger than the GEO confirm dialog:
 *  - the exact text being published is shown in full
 *  - the destination account is named
 *  - the action button is channel-specific ("Publish to X"), never "Confirm"
 *  - the dialog closes on submit; a failure is reported by the caller and
 *    requires opening this dialog again — no silent retry, no polling.
 */
export function PublishConfirmDialog({
  channel,
  account,
  postText,
  disabled,
  pending,
  onPublish,
}: {
  channel: PublishChannel;
  account: string | null;
  postText: string;
  disabled?: boolean;
  pending?: boolean;
  onPublish: () => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = channelMeta[channel];
  const Icon = meta.icon;

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors disabled:opacity-50",
          meta.className,
          "hover:brightness-125",
        )}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Icon className="h-3.5 w-3.5" />
        )}
        Publish to {meta.label}
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber" />
              Publish publicly to {meta.label}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This posts publicly, immediately, under a real account. It cannot be undone
              from this dashboard — you would have to delete it on {meta.label} yourself.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-border/60 bg-background/60 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Destination
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <Icon className="h-3.5 w-3.5" />
                <span className="font-medium">{meta.label}</span>
                <span className="font-mono text-[11.5px] text-muted-foreground">
                  {account ?? "account not reported by backend"}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Exact text being published
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {postText.length} chars
                </span>
              </div>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-foreground/90">
                {postText}
              </pre>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onPublish();
              }}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Send className="h-3.5 w-3.5" />
              Publish to {meta.label}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
