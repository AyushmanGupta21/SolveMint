"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAccount, useReadContract, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCreateTask, INITIAL_FORM } from "@/hooks/useCreateTask";
import { useCompanyTasks } from "@/hooks/useTasks";
import { TaskForm } from "@/components/company/TaskForm";
import { TaskSummaryPanel } from "@/components/company/TaskSummaryPanel";
import { PostedTaskCard } from "@/components/company/PostedTaskCard";
import { SOLVEMINT_ABI, SOLVEMINT_ADDRESS } from "@/lib/contract";
import type { TaskFormState } from "@/types";

export default function CompanyPage() {
  const { address, isConnected } = useAccount();
  const [form, setForm] = useState<TaskFormState>(INITIAL_FORM);
  const [view, setView] = useState<"dashboard" | "create" | "posted">("dashboard");
  const { createTask, status, errorMsg, txHash, explorerUrl } = useCreateTask();
  const { tasks: companyTasks, loading: companyTasksLoading } = useCompanyTasks(address);

  const { data: taskCount } = useReadContract({
    address: SOLVEMINT_ADDRESS,
    abi: SOLVEMINT_ABI,
    functionName: "taskCount",
  });

  async function handleSubmit() {
    const hash = await createTask(form);
    if (hash) {
      setForm(INITIAL_FORM);
    }
  }

  return (
    <>
      <Head>
        <title>Company Dashboard — SolveMint</title>
        <meta name="description" content="Create AI labeling tasks" />
      </Head>

      <div className="min-h-screen bg-[#111111] text-white font-sans flex flex-col">
        {/* Custom Navbar */}
        <header className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-[#111111] sticky top-0 z-50">
          <Link href="/">
            <img src="/solvemint-logo.png" alt="SolveMint" className="h-8 cursor-pointer" />
          </Link>
          
          <nav className="flex items-center gap-8 text-sm font-medium">
            <button 
              onClick={() => setView('create')} 
              className={`transition-colors ${view === 'create' ? 'text-white' : 'text-[#BBBBBB] hover:text-white'}`}
            >
              Task Form
            </button>
            <button 
              onClick={() => setView('posted')} 
              className={`transition-colors ${view === 'posted' ? 'text-white' : 'text-[#BBBBBB] hover:text-white'}`}
            >
              Posted Tasks
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
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-[#1a1a1a] border border-white/10 p-10 rounded-2xl text-center max-w-sm">
                <p className="text-2xl mb-4">🔗</p>
                <p className="text-white text-xl font-semibold mb-2">Wallet Disconnected</p>
                <p className="text-[#888888]">Please connect your wallet to access the Creator Dashboard.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full max-w-7xl mx-auto px-8 md:px-16 py-6">
              {view === "dashboard" && (
                <div className="mt-16 max-w-2xl">
                  <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6 font-sans">
                    <span className="text-[#888888]">Create </span>
                    <span className="text-white">tasks, </span><br/>
                    <span className="text-white">train </span>
                    <span className="text-[#888888]">your </span>
                    <span className="text-white">models.</span>
                  </h1>

                  <p className="text-[#BBBBBB] text-base leading-relaxed mb-10 max-w-[500px]">
                    Upload datasets, set your own customized crypto rewards, and receive high-quality data annotations back from our decentralized workforce.
                  </p>

                  <button
                    onClick={() => setView('create')}
                    className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
                  >
                    Add Tasks
                  </button>
                </div>
              )}

              {view === "create" && (
                <div className="animate-fade-in">
                  <div className="mb-5">
                    <h1 className="text-[28px] font-bold text-white mb-1.5 tracking-tight">Create Task</h1>
                    <p className="text-[#888888] text-[14px]">Deploy new labeling tasks to the network.</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="relative z-0 lg:col-span-3 group">
                      <div className="absolute -inset-px bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#a855f7] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500 -z-10"></div>
                      <div className="relative z-10 bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 h-full">
                        <TaskForm form={form} onChange={setForm} />
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <TaskSummaryPanel
                        form={form}
                        status={status}
                        errorMsg={errorMsg}
                        txHash={txHash}
                        explorerUrl={explorerUrl}
                        onSubmit={handleSubmit}
                        address={address!}
                      />
                    </div>
                  </div>
                </div>
              )}

              {view === "posted" && (
                <div className="animate-fade-in">
                  <div className="mb-5">
                    <h1 className="text-[28px] font-bold text-white mb-1.5 tracking-tight">Posted Tasks</h1>
                    <p className="text-[#888888] text-[14px]">Manage and view the status of your tasks.</p>
                  </div>
                  {companyTasksLoading ? (
                    <div className="bg-[#161616] border border-white/5 rounded-2xl p-10 text-center text-slate-400">Loading your tasks…</div>
                  ) : companyTasks.length === 0 ? (
                    <div className="bg-[#161616] border border-white/5 rounded-2xl p-10 text-center text-[#888888]">
                      You haven&apos;t posted any tasks yet. Create one to start tracking progress here.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {companyTasks.map((task) => (
                        <PostedTaskCard key={task.id.toString()} task={task} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
