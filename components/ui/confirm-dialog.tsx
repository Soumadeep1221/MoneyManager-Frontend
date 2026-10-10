"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <Modal open={open} onClose={onClose} size="sm" persistent={loading}>
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className={cn(
            "flex items-center justify-center h-12 w-12 rounded-full",
            isDanger ? "bg-danger-light" : "bg-warning-light"
          )}
        >
          <AlertTriangle
            size={22}
            className={isDanger ? "text-danger" : "text-warning"}
          />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-foreground-muted">{description}</p>
        </div>
        <div className="flex gap-2 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-9 px-4 text-sm font-medium rounded-md border border-border bg-background-secondary text-foreground hover:bg-divider transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 h-9 px-4 text-sm font-medium rounded-md text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2",
              isDanger
                ? "bg-danger hover:bg-opacity-90"
                : "bg-warning hover:bg-opacity-90"
            )}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
