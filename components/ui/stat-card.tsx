import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "income" | "expense" | "warning" | "info" | "neutral";

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
}

const toneMap: Record<Tone, { icon: string; bg: string }> = {
  income:   { icon: "text-success", bg: "bg-success-light" },
  expense:  { icon: "text-danger", bg: "bg-danger-light" },
  warning:  { icon: "text-warning", bg: "bg-warning-light" },
  info:     { icon: "text-info", bg: "bg-info-light" },
  neutral:  { icon: "text-primary", bg: "bg-primary-light" },
};

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = "neutral",
  className,
}: StatCardProps) {
  const t = toneMap[tone];

  return (
    <div
      className={cn(
        "bg-background-secondary rounded-lg border border-border p-4",
        "hover:border-foreground-muted/20 hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-foreground-muted leading-snug">{label}</p>
        <div className={cn("flex items-center justify-center h-8 w-8 rounded-md flex-shrink-0 ml-2", t.bg)}>
          <Icon size={16} className={t.icon} strokeWidth={2} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums leading-none tracking-tight">
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-foreground-muted mt-2 leading-none">{subtext}</p>
      )}
    </div>
  );
}
