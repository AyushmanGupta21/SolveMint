# SolveMint

> Decentralized AI data-labeling marketplace where companies lock rewards on-chain and workers earn by submitting answers.

SolveMint is a beginner-friendly Web3 app that combines a modern frontend, lightweight backend, IPFS storage, and a Solidity smart contract.

## ✨ Project Description

In traditional labeling platforms, rewards and trust are controlled by a central platform.

SolveMint removes that middle layer:
- **Companies** create tasks and lock funds on-chain.
- **Workers** answer tasks using their wallets.
- **Smart contract** resolves results by majority vote.
- **Winners** (workers who selected the majority option) are paid automatically.

Everything critical is transparent and verifiable on-chain.

## 🚀 What It Does

1. Company creates a micro-labeling task (image or text).
2. Task data is pinned to IPFS.
3. Company locks funds while creating the task on-chain.
4. Workers submit answers.
5. Once required submissions are reached, majority answer is calculated.
6. Locked pool is distributed equally among majority winners.
7. If task expires before completion, company can receive refund.

## ✅ Features

- **Company Dashboard**
	- Create labeling tasks
	- Lock reward funds on-chain
	- Track posted task evolution and submission progress

- **Worker Dashboard**
	- Browse open/resolved tasks
	- Submit answers directly on-chain
	- See reward-per-task context before submitting

- **On-chain Trust Logic (SolveMint.sol)**
	- Escrowed task funding
	- One submission per worker per task
	- Majority-based result resolution
	- Equal payout distribution among majority winners
	- Deadline-based refund path

- **IPFS Integration**
	- Stores task metadata/content off-chain
	- Keeps large payloads out of smart contract storage

- **Wallet + Testnet Ready**
	- RainbowKit + Wagmi integration
	- Configured for **Celo Sepolia** testnet

## 🧱 Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Wagmi, RainbowKit, Viem
- **Backend:** Node.js, Express, Multer, Pinata API
- **Smart Contracts:** Solidity, Hardhat
- **Storage:** IPFS (via Pinata)
- **Network:** Celo Sepolia (testnet)

## 📦 Monorepo Structure

```text
apps/
	web/         # Next.js frontend (company + worker dashboards)
	api/         # Express API for Pinata/IPFS uploads
packages/
	contracts/   # Solidity contract + Hardhat scripts
```

## 📍 Deployed Smart Contract

- **Network:** Celo Sepolia
- **Contract:** `SolveMint`
- **Address:** `0x65fb53CC36d5F5f3B5D2a431ea7AF51c7a844C8B`
- **Explorer:** https://celo-sepolia.blockscout.com/address/0x65fb53CC36d5F5f3B5D2a431ea7AF51c7a844C8B

> If you redeploy, update `NEXT_PUBLIC_SOLVEMINT_ADDRESS` in your env file.

## 🛠️ Getting Started (Beginner Friendly)

### 1) Prerequisites

- Node.js `>=18.18.0`
- MetaMask wallet
- Celo Sepolia test CELO for transactions

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

Create/update these values in your env file:

- `CELO_SEPOLIA_RPC_URL`
- `NEXT_PUBLIC_SOLVEMINT_ADDRESS`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_IPFS_GATEWAY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `PINATA_JWT`
- `PRIVATE_KEY` (testnet burner wallet only)

### 4) Run app (API + Web)

```bash
npm run dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

### 5) Compile contracts

```bash
npm run compile:contracts
```

### 6) Deploy contract (if needed)

```bash
cd packages/contracts
npx hardhat run scripts/deploy.js --network celoSepolia
```

Then set the new address in `NEXT_PUBLIC_SOLVEMINT_ADDRESS` and restart the web app.

## 🔒 Notes

- Use **testnet wallets only**.
- Never commit real private keys for production use.
- This project is built for learning, demos, and hackathon use.

## 🌱 Future Improvements

- Batch/campaign task management
- Reputation and Sybil resistance
- Better analytics/indexing
- Stablecoin reward support
- Tie/dispute handling logic
