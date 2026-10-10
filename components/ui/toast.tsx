"use client";

import * as React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const ctx: ToastContextValue = React.useMemo(
    () => ({
      toast: addToast,
      success: (m) => addToast("success", m),
      error: (m) => addToast("error", m),
      warning: (m) => addToast("warning", m),
      info: (m) => addToast("info", m),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const toastConfig: Record<
  ToastType,
  { icon: React.ComponentType<{ size?: number; className?: string }>; bgClass: string; iconClass: string }
> = {
  success: { icon: CheckCircle2, bgClass: "bg-success-light border border-success/20", iconClass: "text-success" },
  error:   { icon: XCircle,      bgClass: "bg-danger-light border border-danger/20", iconClass: "text-danger" },
  warning: { icon: AlertTriangle, bgClass: "bg-warning-light border border-warning/20", iconClass: "text-warning" },
  info:    { icon: Info,          bgClass: "bg-info-light border border-info/20", iconClass: "text-info" },
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => {
        const cfg = toastConfig[t.type];
        const Icon = cfg.icon;
        return (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-md shadow-md pointer-events-auto",
              "max-w-sm w-full animate-slide-down",
              cfg.bgClass
            )}
            role="alert"
          >
            <Icon size={16} className={cn("mt-0.5 flex-shrink-0", cfg.iconClass)} />
            <p className="text-sm text-foreground flex-1">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className="flex-shrink-0 p-0.5 rounded text-foreground-muted hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
