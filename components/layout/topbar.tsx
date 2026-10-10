"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":    { title: "Dashboard",    subtitle: "Your financial overview" },
  "/income":       { title: "Income",       subtitle: "Manage your income sources" },
  "/expenses":     { title: "Expenses",     subtitle: "Track your spending" },
  "/categories":   { title: "Categories",   subtitle: "Organize your transactions" },
  "/transactions": { title: "Transactions", subtitle: "View all transactions" },
  "/settings":     { title: "Settings",     subtitle: "Manage your profile" },
};

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const match = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([key]) => pathname === key || pathname.startsWith(key + "/"));

  const { title = "Money Manager", subtitle } = match?.[1] ?? {};

  return (
    <header className="h-16 border-b border-border bg-background-secondary/50 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 gap-4 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </Button>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-foreground-muted truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Avatar
          name={user?.fullName || user?.email || "U"}
          src={user?.profileImageUrl}
          size="sm"
        />
      </div>
    </header>
  );
}
