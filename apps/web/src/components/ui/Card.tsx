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
    <div className={`${hover ? "glass-hover" : "glass"} ${padding} ${className}`}>
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
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? "text-accent-400 font-bold" : "text-white font-medium"}>
        {value}
      </span>
    </div>
  );
}
