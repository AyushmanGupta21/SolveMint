import React from "react";

type StatusVariant = "error" | "success" | "info";

const VARIANT_STYLES: Record<StatusVariant, string> = {
  error: "bg-red-500/10 border-red-500/30 text-red-400",
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  info: "bg-brand-500/10 border-brand-500/30 text-brand-300",
};

interface StatusMessageProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

/** Colored alert box for status feedback (error / success / info). */
export function StatusMessage({ variant, children, className = "" }: StatusMessageProps) {
  return (
    <div
      className={`p-3 rounded-xl border text-xs break-all
        ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
