import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "income"
  | "expense"
  | "warning"
  | "success"
  | "info"
  | "muted"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "xs" | "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary-light text-primary",
  income:  "bg-success-light text-success",
  expense: "bg-danger-light text-danger",
  warning: "bg-warning-light text-warning",
  success: "bg-success-light text-success",
  info:    "bg-info-light text-info",
  muted:   "bg-divider text-foreground-muted",
  outline: "border border-border text-foreground bg-transparent",
};

export function Badge({
  children,
  variant = "default",
  className,
  size = "sm",
}: BadgeProps) {
  const sizeStyles = {
    xs: "text-xs px-2 py-0.5",
    sm: "text-xs px-2.5 py-1",
    md: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
