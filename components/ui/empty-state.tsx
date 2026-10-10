import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const padding    = size === "sm" ? "py-10" : size === "lg" ? "py-16" : "py-12";
  const iconWrap   = size === "sm" ? "h-12 w-12" : "h-14 w-14";
  const iconSize   = size === "sm" ? 22 : 28;

  return (
    <div className={cn("flex flex-col items-center justify-center text-center", padding, className)}>
      <div className={cn("flex items-center justify-center rounded-md bg-divider mb-4", iconWrap)}>
        <Icon size={iconSize} className="text-foreground-muted" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-sm text-foreground-muted max-w-xs leading-relaxed mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
