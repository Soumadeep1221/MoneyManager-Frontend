"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, TrendingDown, Tag,
  ArrowLeftRight, LogOut, Wallet, X, Settings,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/income",       label: "Income",       icon: TrendingUp },
  { href: "/expenses",     label: "Expenses",     icon: TrendingDown },
  { href: "/categories",   label: "Categories",   icon: Tag },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/settings",    label: "Settings",    icon: Settings },
] as const;

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navContent = (
    <nav className="flex flex-col h-full select-none bg-background-secondary">
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary shadow-sm">
          <Wallet size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-foreground font-bold text-sm tracking-tight">
          MoneyManager
        </span>
        <button
          type="button"
          onClick={onMobileClose}
          className="ml-auto lg:hidden flex items-center justify-center h-8 w-8 rounded-md text-foreground-muted hover:text-foreground hover:bg-divider transition-colors"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto pt-4 pb-2 px-2 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground hover:bg-divider"
              )}
            >
              <Icon
                size={16}
                className={active ? "text-white" : "text-foreground-muted"}
                strokeWidth={active ? 2.5 : 2}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── User section ── */}
      <div className="flex-shrink-0 px-2 py-3 border-t border-border space-y-1">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md">
            <Avatar
              name={user.fullName || user.email || "U"}
              src={user.profileImageUrl}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate leading-snug">
                {user.fullName || user.email?.split("@")[0]}
              </p>
              <p className="text-xs text-foreground-muted truncate leading-snug">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 h-9 rounded-md text-sm font-medium text-foreground-muted hover:text-danger hover:bg-danger-light transition-all duration-150"
        >
          <LogOut size={16} className="text-foreground-muted" />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0 border-r border-border">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden animate-slide-up shadow-lg border-r border-border">
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}
