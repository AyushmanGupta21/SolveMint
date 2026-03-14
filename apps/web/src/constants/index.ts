// ─── Chain constants (testnet-only) ──────────────────────────────────────────

export const CHAIN_IDS = {
  SEPOLIA: 11155111,
  POLYGON_AMOY: 80002,
} as const;

/** Returns the block explorer tx URL for the given testnet chain. */
export function explorerTxUrl(chainId: number, txHash: string): string {
  switch (chainId) {
    case CHAIN_IDS.POLYGON_AMOY:
      return `https://amoy.polygonscan.com/tx/${txHash}`;
    case CHAIN_IDS.SEPOLIA:
    default:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
}

/** Returns the block explorer address URL for the given testnet chain. */
export function explorerAddressUrl(chainId: number, address: string): string {
  switch (chainId) {
    case CHAIN_IDS.POLYGON_AMOY:
      return `https://amoy.polygonscan.com/address/${address}`;
    case CHAIN_IDS.SEPOLIA:
    default:
      return `https://sepolia.etherscan.io/address/${address}`;
  }
}

// ─── Task form defaults ───────────────────────────────────────────────────────

export const TASK_FORM_DEFAULTS = {
  workers: "3",
  reward: "0.001",
  hours: "24",
  minOptions: 2,
  maxOptions: 10,
} as const;

// ─── App metadata ─────────────────────────────────────────────────────────────

export const APP_NAME = "SolveMint";
export const APP_DESCRIPTION =
  "Decentralised AI data labeling — earn crypto by labeling datasets, no middlemen.";
