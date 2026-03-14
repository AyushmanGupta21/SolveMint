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
  const { submitAnswer, status, errorMsg, txHash } = useSubmitAnswer();

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
        <p className="text-center text-accent-400 text-sm font-semibold">
          Share from a {formatEther(task.totalFunds)} ETH pool if you match the majority ✓
        </p>

        {/* Status feedback */}
        {status === "error" && (
          <StatusMessage variant="error">{errorMsg}</StatusMessage>
        )}
        {status === "done" && (
          <StatusMessage variant="success">
            ✅ Answer submitted! Tx: {txHash.slice(0, 14)}…
          </StatusMessage>
        )}

        {/* Action buttons */}
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
