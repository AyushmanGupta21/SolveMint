"use client";

import { formatEther } from "viem";
import { Badge } from "@/components/ui/Badge";
import type { TaskInfo } from "@/types";

interface TaskCardProps {
  task: TaskInfo;
  onSolve: (task: TaskInfo) => void;
}

export function TaskCard({ task, onSolve }: TaskCardProps) {
  const isExpired = Date.now() / 1000 > Number(task.deadline);
  const isOpen = !task.resolved && !isExpired;
  const progress = Number(task.submissionCount);
  const required = Number(task.workersRequired);
  const percentage = required > 0 ? Math.min(100, (progress / required) * 100) : 0;

  const badgeVariant = task.resolved ? "resolved" : isExpired ? "expired" : "open";
  const badgeLabel = task.resolved ? "Resolved" : isExpired ? "Expired" : "Open";
  const taskPool = task.workersRequired * task.rewardPerWorker;

  return (
    <div className="glass-hover p-5 flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-white text-sm line-clamp-2">
          {task.metadata?.question ?? "Loading question…"}
        </p>
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
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
          <span className="font-bold bg-gradient-to-r from-[#a855f7] to-[#e9d5ff] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
            Pool: {formatEther(taskPool)} ETH
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
