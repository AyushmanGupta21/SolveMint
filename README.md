# SolveMint

SolveMint is a decentralized AI data labeling prototype built for hackathons. Companies lock labeling rewards onchain, workers solve micro-tasks with their wallets, and the contract distributes payouts to workers who match the majority answer.

## Monorepo layout

- `apps/web`: Next.js frontend for companies and workers.
- `apps/api`: Express API for IPFS uploads through Pinata.
- `packages/contracts`: Solidity smart contract and deployment scripts.

## System architecture

### 1. Frontend

The frontend is a Next.js app using Tailwind CSS and `wagmi` for wallet connectivity. It has two main operating modes:

- Company dashboard: create a task, upload dataset content to IPFS, lock funds in the contract, and monitor progress.
- Worker dashboard: browse open tasks, inspect the uploaded item, submit an answer, and track earnings.

### 2. Backend

The Express API is intentionally thin. Its purpose is to:

- accept file uploads from the frontend,
- pin files and JSON metadata to IPFS using Pinata,
- keep Pinata credentials off the client.

### 3. Smart contract

The Solidity contract handles the trust-sensitive flow:

- task creation,
- reward escrow,
- worker submission tracking,
- majority-answer resolution,
- worker payouts,
- deadline-based refunds.

### 4. Storage model

For a hackathon prototype, each task represents one micro-labeling item. The dataset payload is stored in IPFS metadata with:

- file CID or raw text,
- prompt,
- answer options,
- display metadata for the frontend.

That keeps heavy content off-chain while preserving a verifiable content address.

## End-to-end flow

1. Company uploads an image or enters text.
2. Frontend sends that content to the API.
3. API pins the file and task metadata to IPFS.
4. Frontend calls `createTask` on the contract and locks `workersRequired * rewardPerWorker`.
5. Workers browse open tasks from contract state.
6. Workers submit answers onchain.
7. When enough answers arrive, the contract computes the majority option.
8. Workers who selected the majority answer receive the fixed reward.
9. Any leftover escrow is refunded to the company.
10. If the deadline expires before enough responses, anyone can trigger a refund to the company.

## Local setup

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies:

```bash
npm install
```

3. Start the API and frontend:

```bash
npm run dev
```

4. Compile the contract:

```bash
npm run compile:contracts
```

5. Deploy to Polygon Amoy:

```bash
npm run deploy:amoy
```

6. Put the deployed contract address into `NEXT_PUBLIC_SOLVEMINT_ADDRESS` and restart the frontend.

## Contract deployment notes

- Fund the deployer wallet with testnet ETH or MATIC.
- MetaMask should be connected to the same chain as the deployed contract.
- Pinata JWT is required for IPFS uploads.

## Hackathon tradeoffs

This prototype optimizes for speed and clarity over protocol complexity. It uses one task per dataset item, direct majority consensus, and onchain payout loops sized for small worker counts.

## Recommended next improvements

- batch tasks into campaigns,
- add anti-sybil reputation or worker staking,
- use an indexer for richer analytics,
- support ERC-20 stablecoin rewards,
- add dispute resolution for tied results.
