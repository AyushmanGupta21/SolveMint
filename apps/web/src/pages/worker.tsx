"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
  const [view, setView] = useState<"dashboard" | "tasks" | "earnings">("dashboard");

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

      <div className="min-h-screen bg-[#111111] text-white font-sans flex flex-col">
        {/* Custom Navbar */}
        <header className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-[#111111] sticky top-0 z-50">
          <Link href="/">
            <img src="/solvemint-logo.png" alt="SolveMint" className="h-8 cursor-pointer" />
          </Link>
          
          <nav className="flex items-center gap-8 text-sm font-medium">
            <button 
              onClick={() => setView('tasks')} 
              className={`transition-colors ${view === 'tasks' ? 'text-white' : 'text-[#BBBBBB] hover:text-white'}`}
            >
              Active Tasks
            </button>
            <button 
              onClick={() => setView('earnings')} 
              className={`transition-colors ${view === 'earnings' ? 'text-white' : 'text-[#BBBBBB] hover:text-white'}`}
            >
              Earning
            </button>
            <button 
              onClick={() => setView('dashboard')} 
              className={`transition-colors ${view === 'dashboard' ? 'text-white' : 'text-[#BBBBBB] hover:text-white'}`}
            >
              Dashboard
            </button>
          </nav>

          <ConnectButton 
            chainStatus={{ smallScreen: "none", largeScreen: "full" }} 
            accountStatus="avatar" 
            showBalance={false} 
          />
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {!isConnected ? (
            <div className="flex-1 w-full max-w-7xl mx-auto px-8 md:px-16 py-12">
              <div className="mt-16 max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 font-sans">
                  <span className="text-[#888888]">Solve </span>
                  <span className="text-white">tasks, </span><br/>
                  <span className="text-white">earn </span>
                  <span className="text-[#888888]">crypto </span>
                  <span className="text-white">rewards.</span>
                </h1>

                <p className="text-[#BBBBBB] text-base leading-relaxed mb-10 max-w-[500px]">
                  Complete micro-tasks, label data for AI models, and earn precise cryptocurrency payouts directly to your wallet instantly.
                </p>

                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
                    >
                      Connect wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full max-w-7xl mx-auto px-8 md:px-16 py-12">
              {view === "dashboard" && (
                <div className="mt-16 max-w-2xl animate-fade-in">
                  <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 font-sans">
                    <span className="text-[#888888]">Solve </span>
                    <span className="text-white">tasks, </span><br/>
                    <span className="text-white">earn </span>
                    <span className="text-[#888888]">crypto </span>
                    <span className="text-white">rewards.</span>
                  </h1>

                  <p className="text-[#BBBBBB] text-base leading-relaxed mb-10 max-w-[500px]">
                    Complete micro-tasks, label data for AI models, and earn precise cryptocurrency payouts directly to your wallet instantly.
                  </p>

                  <button
                    onClick={() => setView('tasks')}
                    className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
                  >
                    Start Solving
                  </button>
                </div>
              )}

              {view === "tasks" && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2">Active Tasks</h1>
                    <p className="text-[#888888]">Browse open tasks, submit answers, and earn on-chain rewards.</p>
                  </div>
                  {!taskCount || taskCount === 0n ? (
                    <div className="bg-[#161616] border border-white/5 rounded-2xl p-10 text-center text-[#888888]">
                      No tasks yet. Check back soon or ask a company to post one!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.from({ length: Number(taskCount) }, (_, i) =>
                        BigInt(Number(taskCount) - i)
                      ).map((id) => (
                        <TaskFetcher key={id.toString()} taskId={id} onSolve={setActiveTask} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {view === "earnings" && (
                 <div className="animate-fade-in">
                   <div className="mb-8">
                     <h1 className="text-3xl font-extrabold text-white mb-2">Your Earnings</h1>
                     <p className="text-[#888888]">Track your completed tasks and claimable cryptocurrency.</p>
                   </div>
                   <EarningsDashboard address={address!} />
                 </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Solve modal */}
      {activeTask && (
        <SolveModal task={activeTask} onClose={() => setActiveTask(null)} />
      )}
    </>
  );
}
