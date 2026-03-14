// ABI extracted from compiled SolveMint.sol
// Run `npm run compile` in packages/contracts to regenerate

export const SOLVEMINT_ABI = [
  // createTask
  {
    type: "function",
    name: "createTask",
    stateMutability: "payable",
    inputs: [
      { name: "metadataCID", type: "string" },
      { name: "optionCount",  type: "uint8" },
      { name: "workersRequired", type: "uint256" },
      { name: "rewardPerWorker", type: "uint256" },
      { name: "deadline",    type: "uint256" },
    ],
    outputs: [{ name: "taskId", type: "uint256" }],
  },
  // submitAnswer
  {
    type: "function",
    name: "submitAnswer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId",      type: "uint256" },
      { name: "optionIndex", type: "uint8" },
    ],
    outputs: [],
  },
  // claimRefund
  {
    type: "function",
    name: "claimRefund",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
  },
  // taskCount
  {
    type: "function",
    name: "taskCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // tasks
  {
    type: "function",
    name: "tasks",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [
      { name: "company",          type: "address" },
      { name: "metadataCID",      type: "string" },
      { name: "optionCount",      type: "uint8" },
      { name: "workersRequired",  type: "uint256" },
      { name: "rewardPerWorker",  type: "uint256" },
      { name: "deadline",         type: "uint256" },
      { name: "totalFunds",       type: "uint256" },
      { name: "resolved",         type: "bool" },
      { name: "refunded",         type: "bool" },
      { name: "submissionCount",  type: "uint256" },
    ],
  },
  // submissionCount
  {
    type: "function",
    name: "submissionCount",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  // workerAnswer
  {
    type: "function",
    name: "workerAnswer",
    stateMutability: "view",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "worker", type: "address" },
    ],
    outputs: [{ name: "", type: "uint8" }],
  },
  // optionTally
  {
    type: "function",
    name: "optionTally",
    stateMutability: "view",
    inputs: [
      { name: "taskId",      type: "uint256" },
      { name: "optionIndex", type: "uint8" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  // ── Events ──────────────────────────────────────
  {
    type: "event",
    name: "TaskCreated",
    inputs: [
      { name: "taskId",           type: "uint256", indexed: true },
      { name: "company",          type: "address", indexed: true },
      { name: "metadataCID",      type: "string",  indexed: false },
      { name: "workersRequired",  type: "uint256", indexed: false },
      { name: "rewardPerWorker",  type: "uint256", indexed: false },
      { name: "deadline",         type: "uint256", indexed: false },
      { name: "totalFunds",       type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AnswerSubmitted",
    inputs: [
      { name: "taskId",      type: "uint256", indexed: true },
      { name: "worker",      type: "address", indexed: true },
      { name: "optionIndex", type: "uint8",   indexed: false },
    ],
  },
  {
    type: "event",
    name: "RewardsDistributed",
    inputs: [
      { name: "taskId",         type: "uint256", indexed: true },
      { name: "majorityOption", type: "uint8",   indexed: false },
      { name: "winnersCount",   type: "uint256", indexed: false },
      { name: "rewardPerWinner",type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RefundIssued",
    inputs: [
      { name: "taskId",   type: "uint256", indexed: true },
      { name: "company",  type: "address", indexed: true },
      { name: "amount",   type: "uint256", indexed: false },
    ],
  },
] as const;

// A real Ethereum address is exactly 0x + 40 hex characters.
// The env placeholder "0xYourDeployedContractAddress" is NOT valid hex, so we
// catch it early and fall back to the Hardhat localhost default.
const _raw = process.env.NEXT_PUBLIC_SOLVEMINT_ADDRESS ?? "";
const _isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(_raw);

/** True only when a real deployed address is present in the env. */
export const CONTRACT_DEPLOYED = _isValidAddress;

export const SOLVEMINT_ADDRESS: `0x${string}` = _isValidAddress
  ? (_raw as `0x${string}`)
  : "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Hardhat localhost default
