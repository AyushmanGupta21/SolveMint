"use client";

import { useState } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import { useAccount, useReadContract } from "wagmi";
import { SOLVEMINT_ABI, SOLVEMINT_ADDRESS } from "@/lib/contract";
import { useSingleTask } from "@/hooks/useTasks";
import { TaskCard } from "@/components/worker/TaskCard";
import { SolveModal } from "@/components/worker/SolveModal";
import { EarningsDashboard } from "@/components/worker/EarningsDashboard";
import type { TaskInfo } from "@/types";

// ── TaskFetcher — load one task by id (avoids hooks-in-loop) ─────────────────

function TaskFetcher({
  taskId,
  onSolve,
}: {
  taskId: bigint;
  onSolve: (task: TaskInfo) => void;
}) {
  const { task } = useSingleTask(taskId);
  if (!task) return null;
  return <TaskCard task={task} onSolve={onSolve} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkerPage() {
  const { address, isConnected } = useAccount();
  const [activeTask, setActiveTask] = useState<TaskInfo | null>(null);
  const [view, setView] = useState<"tasks" | "earnings">("tasks");

  const { data: taskCount } = useReadContract({
    address: SOLVEMINT_ADDRESS,
    abi: SOLVEMINT_ABI,
    functionName: "taskCount",
  });

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
                {(["tasks", "earnings"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setView(tab)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      view === tab
                        ? "bg-brand-600 text-white"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab === "tasks" ? "📋 Task Feed" : "💰 My Earnings"}
                  </button>
                ))}
              </div>

              {view === "tasks" && (
                <>
                  {!taskCount || taskCount === 0n ? (
                    <div className="glass p-10 text-center text-slate-500">
                      No tasks yet. Check back soon or ask a company to post one!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {Array.from({ length: Number(taskCount) }, (_, i) =>
                        BigInt(Number(taskCount) - i)
                      ).map((id) => (
                        <TaskFetcher key={id.toString()} taskId={id} onSolve={setActiveTask} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {view === "earnings" && <EarningsDashboard address={address!} />}
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
