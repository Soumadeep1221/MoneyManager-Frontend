"use client";

import * as React from "react";
import EmojiPicker from "emoji-picker-react";
import {
  Briefcase, Laptop, TrendingUp, Gift, Home, ShoppingCart,
  Car, Utensils, Heart, Zap, Plane, Book, Music, Coffee,
  DollarSign, PiggyBank, CreditCard, Wallet, BarChart2,
  ShoppingBag, Smartphone, Tv, Shirt, Dumbbell, Baby,
  Trees, Moon, Sun, Star, Scissors, Wrench, Package,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Briefcase, Laptop, TrendingUp, Gift, Home, ShoppingCart,
  Car, Utensils, Heart, Zap, Plane, Book, Music, Coffee,
  DollarSign, PiggyBank, CreditCard, Wallet, BarChart2,
  ShoppingBag, Smartphone, Tv, Shirt, Dumbbell, Baby,
  Trees, Moon, Sun, Star, Scissors, Wrench, Package,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function IconDisplay({
  name,
  size = 18,
  className,
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const Icon = name ? ICON_MAP[name] : undefined;
  if (Icon) return <Icon size={size} className={className} />;
  if (name) return <span className={className} style={{ fontSize: size, lineHeight: 1 }} aria-hidden="true">{name}</span>;
  return <DollarSign size={size} className={className} />;
}

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  return (
    <div className={cn("overflow-hidden rounded-md bg-background-secondary", className)}>
      <EmojiPicker 
        onEmojiClick={(emoji) => onChange(emoji.emoji)} 
        width="100%" 
        height={350} 
        searchDisabled={false} 
        skinTonesDisabled={false} 
        previewConfig={{ showPreview: false }} 
      />
    </div>
  );
}

interface IconToggleButtonProps {
  selectedIcon: string;
  open: boolean;
  onToggle: () => void;
  tone?: "income" | "expense" | "neutral";
}

export function IconToggleButton({ selectedIcon, open, onToggle, tone = "neutral" }: IconToggleButtonProps) {
  const bgMap = { 
    income: "bg-success-light", 
    expense: "bg-danger-light", 
    neutral: "bg-primary-light" 
  };
  const colorMap = { 
    income: "text-success", 
    expense: "text-danger", 
    neutral: "text-primary" 
  };
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-input-bg hover:bg-divider hover:border-foreground-muted/30 transition-all text-sm text-foreground w-full"
    >
      <div className={cn("flex items-center justify-center h-6 w-6 rounded-md flex-shrink-0", bgMap[tone])}>
        <IconDisplay name={selectedIcon} size={16} className={colorMap[tone]} />
      </div>
      <span className="flex-1 text-left">{selectedIcon.startsWith("Icon") || ICON_MAP[selectedIcon] ? selectedIcon : "Selected emoji"}</span>
      <Chevron size={14} className="text-foreground-muted flex-shrink-0" />
    </button>
  );
}
