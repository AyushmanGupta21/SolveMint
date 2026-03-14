import React from "react";

type BadgeVariant = "open" | "resolved" | "expired" | "testnet";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  open: "bg-emerald-500/20 text-emerald-400",
  resolved: "bg-brand-500/20 text-brand-400",
  expired: "bg-red-500/20 text-red-400",
  testnet: "bg-amber-500/10 border border-amber-500/30 text-amber-400",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export function Badge({ variant, children, pulse, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
}
