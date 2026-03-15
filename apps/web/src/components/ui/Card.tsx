import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
}

/** Glassmorphism card — set `hover` for interactive hover glow. */
export function Card({ children, className = "", hover, padding = "p-6" }: CardProps) {
  return (
    <div className={`${hover ? "bg-[#1c1c1c] hover:border-white/10" : "bg-[#1c1c1c]"} border border-white/5 rounded-2xl ${padding} ${className} transition-all`}>
      {children}
    </div>
  );
}

/** Horizontal label/value row used inside summary panels. */
export function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between text-[14px]">
      <span className="text-[#888888]">{label}</span>
      <span className={highlight ? "font-bold bg-gradient-to-r from-[#a855f7] to-[#e9d5ff] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "text-[#e2e8f0] font-semibold"}>
        {value}
      </span>
    </div>
  );
}
