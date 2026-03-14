"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, polygonAmoy, sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "SolveMint",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "solvemint-demo",
  chains: [hardhat, polygonAmoy, sepolia],
  ssr: true,
});
