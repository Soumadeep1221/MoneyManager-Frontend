import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

export function Avatar({ name = "", src, size = "md", className }: AvatarProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || "/placeholder-user.jpg"}
      alt={name}
      referrerPolicy="no-referrer"
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = "/placeholder-user.jpg";
      }}
      className={cn(
        "rounded-full object-cover flex-shrink-0 ring-2 ring-background-secondary",
        sizeMap[size],
        className
      )}
    />
  );
}
