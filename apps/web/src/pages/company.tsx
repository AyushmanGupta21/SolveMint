"use client";

import { useState } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import { useAccount, useReadContract } from "wagmi";
import { useCreateTask, INITIAL_FORM } from "@/hooks/useCreateTask";
import { TaskForm } from "@/components/company/TaskForm";
import { TaskSummaryPanel } from "@/components/company/TaskSummaryPanel";
import { SOLVEMINT_ABI, SOLVEMINT_ADDRESS } from "@/lib/contract";
import type { TaskFormState } from "@/types";

export default function CompanyPage() {
  const { address, isConnected } = useAccount();
  const [form, setForm] = useState<TaskFormState>(INITIAL_FORM);
  const { createTask, status, errorMsg, txHash, explorerUrl, setStatus } = useCreateTask();

  const { data: taskCount } = useReadContract({
    address: SOLVEMINT_ADDRESS,
    abi: SOLVEMINT_ABI,
    functionName: "taskCount",
  });

  async function handleSubmit() {
    const hash = await createTask(form);
    if (hash) setForm(INITIAL_FORM);
  }

  return (
    <>
      <Head>
        <title>Company Dashboard — SolveMint</title>
        <meta name="description" content="Create AI labeling tasks and lock rewards on-chain." />
      </Head>
      <Navbar />

      <main className="pt-20 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl font-extrabold text-white mb-2">Company Dashboard</h1>
            <p className="text-slate-400">
              Create micro-labeling tasks and lock rewards on-chain.
              {taskCount !== undefined && (
                <span className="ml-2 text-brand-400 font-medium">
                  {taskCount.toString()} tasks deployed so far.
                </span>
              )}
            </p>
          </div>

          {!isConnected ? (
            <div className="glass p-10 text-center animate-fade-in">
              <p className="text-2xl mb-2">🔗</p>
              <p className="text-slate-300 text-lg font-semibold mb-1">Connect your wallet</p>
              <p className="text-slate-500">Use the Connect Wallet button in the top-right corner.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slide-up">
              {/* Form */}
              <div className="lg:col-span-3 glass p-6">
                <h2 className="font-bold text-white text-lg border-b border-white/10 pb-4 mb-6">
                  New Task
                </h2>
                <TaskForm form={form} onChange={setForm} />
              </div>

              {/* Summary panel */}
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
          )}
        </div>
      </main>
    </>
  );
}
