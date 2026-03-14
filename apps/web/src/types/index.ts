// ─── Task types ───────────────────────────────────────────────────────────────

/** Metadata stored on IPFS for each labeling task. */
export interface TaskMetadata {
  question: string;
  options: string[];
  contentUrl: string;   // image URL — empty string for text tasks
  contentText: string;  // raw text — empty string for image tasks
  contentType: "image" | "text";
}

/** On-chain task data merged with optional off-chain metadata. */
export interface TaskInfo {
  id: bigint;
  company: string;
  metadataCID: string;
  optionCount: number;
  workersRequired: bigint;
  rewardPerWorker: bigint;
  deadline: bigint;
  totalFunds: bigint;
  resolved: boolean;
  refunded: boolean;
  submissionCount: bigint;
  metadata?: TaskMetadata;
}

/** Shape of the task creation form. */
export interface TaskFormState {
  contentType: "image" | "text";
  imageFile: File | null;
  imagePreview: string;
  contentText: string;
  question: string;
  options: string[];
  workers: string;
  reward: string;   // ETH
  hours: string;    // deadline from now
}

/** Submission status for async operations. */
export type TxStatus = "idle" | "uploading" | "txn" | "pending" | "done" | "error";
