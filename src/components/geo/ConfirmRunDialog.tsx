import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Explicit confirmation gate for paid GEO citation runs.
 * Nothing in the GEO screens may call POST endpoints without passing
 * through this dialog — no auto-run, no polling.
 */
export function ConfirmRunDialog({
  trigger,
  engines = 4,
  title = "Run citation check?",
  description,
  confirmLabel = "Run check",
  disabled,
  onConfirm,
}: {
  trigger: ReactNode;
  engines?: number;
  title?: string;
  description?: string;
  confirmLabel?: string;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              `This queries ${engines} answer engines (ChatGPT, Perplexity, Gemini, Claude) using paid API calls — a few cents per run. It only runs when you confirm.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
