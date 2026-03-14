"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat } from "wagmi/chains";
import { defineChain } from "viem";

/**
 * Celo Sepolia is not yet a named export in the installed wagmi/chains version,
 * so we define it explicitly using viem's defineChain helper.
 */
export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://celo-sepolia.blockscout.com",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "SolveMint",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "solvemint-demo",
  chains: [celoSepolia, hardhat],
  ssr: true,
});
