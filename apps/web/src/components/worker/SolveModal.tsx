"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useSubmitAnswer } from "@/hooks/useSubmitAnswer";
import { StatusMessage } from "@/components/ui/StatusMessage";
import type { TaskInfo } from "@/types";

interface SolveModalProps {
  task: TaskInfo;
  onClose: () => void;
}

export function SolveModal({ task, onClose }: SolveModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const { submitAnswer, status, errorMsg, txHash, explorerUrl } = useSubmitAnswer();
  const taskPool = task.workersRequired * task.rewardPerWorker;

  async function handleSubmit() {
    if (selected === null) return;
    await submitAnswer(task.id, selected);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-lg p-8 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-white text-lg">
            Solve Task #{task.id.toString()}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
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
        <p className="text-center text-sm font-bold bg-gradient-to-r from-[#a855f7] to-[#e9d5ff] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
          Share from a {formatEther(taskPool)} ETH pool if you match the majority ✓
        </p>

        {/* Status feedback */}
        {status === "txn" && (
          <StatusMessage variant="info">
            Waiting for wallet confirmation. Please approve in MetaMask.
          </StatusMessage>
        )}
        {status === "pending" && (
          <StatusMessage variant="info">
            Transaction submitted. Waiting for confirmation. {" "}
            {txHash && (
              <a href={explorerUrl} target="_blank" rel="noreferrer" className="underline">
                View on testnet explorer
              </a>
            )}
          </StatusMessage>
        )}
        {status === "error" && (
          <StatusMessage variant="error">{errorMsg}</StatusMessage>
        )}
        {status === "done" && (
          <StatusMessage variant="success">
            ✅ Answer confirmed! {" "}
            {txHash && (
              <a href={explorerUrl} target="_blank" rel="noreferrer" className="underline">
                Tx: {txHash.slice(0, 14)}…
              </a>
            )}
          </StatusMessage>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              selected === null ||
              status === "txn" ||
              status === "pending" ||
              status === "done"
            }
            className="btn-primary flex-1"
          >
            {status === "txn"
              ? "🦊 Confirm in wallet…"
              : status === "pending"
              ? "⏳ Confirming on chain…"
              : "Submit Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}
