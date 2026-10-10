import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap",
    "rounded-md text-sm transition-all duration-200 select-none cursor-pointer",
    "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    "active:scale-[0.98]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:flex-shrink-0",
  ],
  {
    variants: {
      variant: {
        // Primary action button - deep teal
        default:
          "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md active:shadow-sm",
        
        // Secondary action - subtle background
        secondary:
          "bg-primary-light text-primary hover:bg-opacity-80 border border-primary/20",
        
        // Outline - borderless with subtle background
        outline:
          "border border-border text-foreground bg-background hover:bg-divider hover:border-foreground-muted",
        
        // Ghost - minimal, text only
        ghost:
          "text-foreground hover:bg-divider",
        
        // Danger actions
        destructive:
          "bg-danger text-white hover:bg-opacity-90 shadow-sm hover:shadow-md",
        
        // Danger outline
        "destructive-outline":
          "border border-danger-light bg-danger-light text-danger hover:bg-opacity-75",
        
        // Success actions
        success:
          "bg-success text-white hover:bg-opacity-90 shadow-sm hover:shadow-md",
        
        // Link style
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs:        "h-6 px-2 text-xs rounded-sm gap-1",
        sm:        "h-8 px-3 text-sm gap-1.5",
        default:   "h-9 px-4 text-sm gap-2",
        lg:        "h-10 px-5 text-base gap-2",
        xl:        "h-11 px-6 text-base gap-2",
        icon:      "h-9 w-9 p-0 rounded-md",
        "icon-sm": "h-8 w-8 p-0 rounded-sm",
        "icon-xs": "h-6 w-6 p-0 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, isLoading, children, disabled, ...props }, ref) => {
    const isActuallyLoading = loading || isLoading;
    return (
      <button
        ref={ref}
        disabled={disabled || isActuallyLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isActuallyLoading && (
          <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin flex-shrink-0" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
