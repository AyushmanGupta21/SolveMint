import React from "react";

type BadgeVariant = "open" | "resolved" | "expired" | "testnet";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  open: "bg-[#064e3b]/40 text-[#34d399] border border-[#064e3b]",
  resolved: "bg-[#4c1d95]/40 text-[#a78bfa] border border-[#4c1d95]",
  expired: "bg-[#7f1d1d]/40 text-[#f87171] border border-[#7f1d1d]",
  testnet: "bg-[#78350f]/40 text-[#fbbf24] border border-[#78350f]",
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
