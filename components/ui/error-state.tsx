"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
  className,
  size = "md",
}: ErrorStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      size === "sm" ? "py-10" : "py-12",
      className
    )}>
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-danger-light mb-4">
        <AlertCircle size={22} className="text-danger" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      <p className="text-sm text-foreground-muted max-w-xs leading-relaxed mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 h-8 px-3 text-sm font-medium rounded-md border border-border text-foreground hover:bg-divider transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
