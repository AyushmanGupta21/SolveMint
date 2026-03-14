"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";

const LINKS = [
  { href: "/",        label: "Home" },
  { href: "/company", label: "Company" },
  { href: "/worker",  label: "Worker" },
];

export default function Navbar() {
  const { pathname } = useRouter();

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#0a0b14]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex items-center justify-between h-16 px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 select-none">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-500/30">
            S
          </span>
          <span className="font-bold text-lg tracking-tight gradient-text">SolveMint</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                pathname === href
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </header>
  );
}
