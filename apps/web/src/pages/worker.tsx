"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { SOLVEMINT_ABI, SOLVEMINT_ADDRESS } from "@/lib/contract";
import { fetchTaskMetadata, type TaskMetadata } from "@/lib/ipfs";

// ── Types ────────────────────────────────────────────────────────────────────

interface TaskInfo {
  id:               bigint;
  company:          string;
  metadataCID:      string;
  optionCount:      number;
  workersRequired:  bigint;
  rewardPerWorker:  bigint;
  deadline:         bigint;
  totalFunds:       bigint;
  resolved:         boolean;
  refunded:         boolean;
  submissionCount:  bigint;
  metadata?:        TaskMetadata;
}

// ── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onSolve,
}: {
  task: TaskInfo;
  onSolve: (task: TaskInfo) => void;
}) {
  const isExpired  = Date.now() / 1000 > Number(task.deadline);
  const isOpen     = !task.resolved && !isExpired;
  const progress   = Number(task.submissionCount);
  const required   = Number(task.workersRequired);
  const percentage = required > 0 ? Math.min(100, (progress / required) * 100) : 0;

  return (
    <div className="glass-hover p-5 flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-white text-sm line-clamp-2">
          {task.metadata?.question ?? "Loading question…"}
        </p>
        <span
          className={
            task.resolved
              ? "badge-resolved"
              : isExpired
              ? "badge-expired"
              : "badge-open"
          }
        >
          {task.resolved ? "Resolved" : isExpired ? "Expired" : "Open"}
        </span>
      </div>

      {/* Dataset preview */}
      {task.metadata?.contentType === "image" && task.metadata.contentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={task.metadata.contentUrl}
          alt="task content"
          className="rounded-lg h-28 w-full object-cover border border-white/10"
        />
      )}
      {task.metadata?.contentType === "text" && task.metadata.contentText && (
        <p className="text-slate-400 text-xs bg-white/[0.03] rounded-lg p-3 line-clamp-3">
          {task.metadata.contentText}
        </p>
      )}

      {/* Options preview */}
      <div className="flex flex-wrap gap-2">
        {task.metadata?.options.map((opt) => (
          <span
            key={opt}
            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-slate-300"
          >
            {opt}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{progress}/{required} workers</span>
          <span className="text-accent-400 font-semibold">
            {formatEther(task.rewardPerWorker)} ETH each
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-accent-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Solve button */}
      {isOpen && (
        <button
          onClick={() => onSolve(task)}
          className="btn-primary w-full mt-1 text-sm"
        >
          Solve Task
        </button>
      )}
    </div>
  );
}

// ── SolveModal ───────────────────────────────────────────────────────────────

function SolveModal({
  task,
  onClose,
}: {
  task: TaskInfo;
  onClose: () => void;
}) {
  const { writeContractAsync } = useWriteContract();
  const [selected, setSelected]  = useState<number | null>(null);
  const [status, setStatus]       = useState<"idle" | "pending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg]  = useState("");
  const [txHash, setTxHash]      = useState("");

  async function handleSubmit() {
    if (selected === null) return;
    setStatus("pending");
    setErrorMsg("");
    try {
      const hash = await writeContractAsync({
        address: SOLVEMINT_ADDRESS,
        abi: SOLVEMINT_ABI,
        functionName: "submitAnswer",
        args: [task.id, selected],
      });
      setTxHash(hash);
      setStatus("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.split("\n")[0]);
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-lg p-8 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-white text-lg">Solve Task #{task.id.toString()}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Dataset */}
        {task.metadata?.contentType === "image" && task.metadata.contentUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={task.metadata.contentUrl}
            alt="task content"
            className="rounded-xl w-full max-h-52 object-contain border border-white/10 bg-white/[0.02]"
          />
        )}
        {task.metadata?.contentType === "text" && task.metadata.contentText && (
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10 text-slate-300 text-sm leading-relaxed">
            {task.metadata.contentText}
          </div>
        )}

        {/* Question */}
        <p className="font-semibold text-white text-base">
          {task.metadata?.question}
        </p>

        {/* Answer options */}
        <div className="flex flex-col gap-2.5">
          {task.metadata?.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={`w-full py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                selected === idx
                  ? "border-brand-500 bg-brand-500/20 text-white"
                  : "border-white/10 text-slate-300 hover:border-brand-500/40 hover:bg-white/5"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Reward info */}
        <p className="text-center text-accent-400 text-sm font-semibold">
          Earn {formatEther(task.rewardPerWorker)} ETH if you match the majority ✓
        </p>

        {/* Status messages */}
        {status === "error" && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs break-all">
            {errorMsg}
          </div>
        )}
        {status === "done" && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            ✅ Answer submitted! Tx: {txHash.slice(0, 12)}…
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selected === null || status === "pending" || status === "done"}
            className="btn-primary flex-1"
          >
            {status === "pending" ? "⛓ Submitting…" : "Submit Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WorkerPage() {
  const { address, isConnected } = useAccount();
  const [activeTask, setActiveTask] = useState<TaskInfo | null>(null);
  const [view, setView] = useState<"tasks" | "earnings">("tasks");

  // Read total task count
  const { data: taskCount } = useReadContract({
    address: SOLVEMINT_ADDRESS,
    abi: SOLVEMINT_ABI,
    functionName: "taskCount",
  });

  // We use a child component per task to avoid hook-in-loop issue
  return (
    <>
      <Head>
        <title>Worker Dashboard — SolveMint</title>
        <meta name="description" content="Browse labeling tasks and earn crypto rewards." />
      </Head>
      <Navbar />

      <main className="pt-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-extrabold text-white mb-2">Worker Dashboard</h1>
            <p className="text-slate-400">Browse open tasks, submit answers, and earn on-chain rewards.</p>
          </div>

          {!isConnected ? (
            <div className="glass p-10 text-center">
              <p className="text-2xl mb-2">🔗</p>
              <p className="text-slate-300 text-lg font-semibold mb-1">Connect your wallet</p>
              <p className="text-slate-500">Use the Connect Wallet button in the top-right.</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setView("tasks")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    view === "tasks"
                      ? "bg-brand-600 text-white"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  📋 Task Feed
                </button>
                <button
                  onClick={() => setView("earnings")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    view === "earnings"
                      ? "bg-brand-600 text-white"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  💰 My Earnings
                </button>
              </div>

              {view === "tasks" && (
                <>
                  {taskCount === undefined || taskCount === 0n ? (
                    <div className="glass p-10 text-center text-slate-500">
                      No tasks yet. Check back soon or ask a company to post one!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {Array.from({ length: Number(taskCount) }, (_, i) => Number(taskCount) - i).map(
                        (id) => (
                          <TaskFetcher
                            key={id}
                            taskId={BigInt(id)}
                            onSolve={setActiveTask}
                          />
                        )
                      )}
                    </div>
                  )}
                </>
              )}

              {view === "earnings" && (
                <EarningsDashboard address={address!} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Solve modal */}
      {activeTask && (
        <SolveModal task={activeTask} onClose={() => setActiveTask(null)} />
      )}
    </>
  );
}

// ── TaskFetcher — loads one task via hook ────────────────────────────────────

function TaskFetcher({
  taskId,
  onSolve,
}: {
  taskId: bigint;
  onSolve: (task: TaskInfo) => void;
}) {
  const [metadata, setMetadata] = useState<TaskMetadata | undefined>(undefined);

  const { data } = useReadContract({
    address:      SOLVEMINT_ADDRESS,
    abi:          SOLVEMINT_ABI,
    functionName: "tasks",
    args:         [taskId],
  });

  useEffect(() => {
    if (!data) return;
    const cid = data[1] as string;
    fetchTaskMetadata(cid)
      .then(setMetadata)
      .catch(() => undefined);
  }, [data]);

  if (!data) return null;

  const task: TaskInfo = {
    id:              taskId,
    company:         data[0] as string,
    metadataCID:     data[1] as string,
    optionCount:     data[2] as number,
    workersRequired: data[3] as bigint,
    rewardPerWorker: data[4] as bigint,
    deadline:        data[5] as bigint,
    totalFunds:      data[6] as bigint,
    resolved:        data[7] as boolean,
    refunded:        data[8] as boolean,
    submissionCount: data[9] as bigint,
    metadata,
  };

  return <TaskCard task={task} onSolve={onSolve} />;
}

// ── Earnings Dashboard ────────────────────────────────────────────────────────

function EarningsDashboard({ address }: { address: string }) {
  return (
    <div className="glass p-8 text-center animate-fade-in">
      <div className="text-4xl mb-4">💰</div>
      <h3 className="font-bold text-white text-xl mb-2">Earnings Overview</h3>
      <p className="text-slate-400 text-sm mb-6">
        Your on-chain rewards are paid directly to your wallet when consensus is reached.
        Check your wallet balance for received payments.
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold gradient-text">∞</p>
          <p className="text-slate-500 text-xs mt-1">Tasks Open</p>
        </div>
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-accent-400">Auto</p>
          <p className="text-slate-500 text-xs mt-1">Payout Mode</p>
        </div>
      </div>
      <p className="text-slate-600 text-xs mt-6 font-mono break-all">
        {address}
      </p>
    </div>
  );
}
