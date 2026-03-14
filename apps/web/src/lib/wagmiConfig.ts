"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
// ⚠️  Testnet-only — mainnet chains are intentionally excluded for this build.
import { sepolia, polygonAmoy } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "SolveMint",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "solvemint-demo",
  // Sepolia is the primary testnet; Polygon Amoy is the secondary.
  // DO NOT add mainnet-class chains here during development.
  chains: [sepolia, polygonAmoy],
  ssr: true,
});
