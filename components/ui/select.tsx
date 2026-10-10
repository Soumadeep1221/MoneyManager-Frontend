"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, leftIcon, id, ...props }, ref) => {
    const selectId = id || React.useId();
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 flex items-center text-foreground-muted pointer-events-none z-10">
              {leftIcon}
            </span>
          )}
          <select
            id={selectId}
            ref={ref}
            aria-invalid={hasError}
            className={cn(
              "w-full h-9 rounded-md border bg-input-bg text-sm text-foreground appearance-none",
              "transition-all duration-200 outline-none",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-divider",
              hasError
                ? "border-danger focus:border-danger focus:ring-danger/20"
                : "border-border hover:border-foreground-muted/30",
              leftIcon ? "pl-9 pr-8" : "px-3 pr-8",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 text-foreground-muted pointer-events-none" />
        </div>
        {error && <p className="text-xs text-danger leading-snug">{error}</p>}
        {!error && hint && <p className="text-xs text-foreground-muted leading-snug">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
