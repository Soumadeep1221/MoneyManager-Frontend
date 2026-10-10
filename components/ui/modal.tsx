"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  persistent?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
  persistent = false,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !persistent) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose, persistent]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const sizeClasses = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full bg-background-secondary sm:rounded-xl shadow-lg animate-slide-up",
          "border-0 sm:border border-border",
          "rounded-t-xl sm:rounded-xl",
          "max-h-[92vh] overflow-y-auto",
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-border">
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-foreground leading-snug">
                {title}
              </h2>
              {description && (
                <p className="text-sm text-foreground-muted mt-0.5 leading-snug">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md text-foreground-muted hover:text-foreground hover:bg-divider transition-all"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={cn("px-4", title ? "py-4" : "pt-5 pb-4")}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-2 pt-4 border-t border-border mt-4", className)}>
      {children}
    </div>
  );
}
