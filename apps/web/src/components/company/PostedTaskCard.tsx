"use client";

import { formatEther } from "viem";
import { Badge } from "@/components/ui/Badge";
import type { TaskInfo } from "@/types";

interface PostedTaskCardProps {
  task: TaskInfo;
}

function formatDeadline(deadline: bigint): string {
  const now = Date.now() / 1000;
  const secondsLeft = Number(deadline) - now;

  if (secondsLeft <= 0) return "Expired";

  const hours = Math.floor(secondsLeft / 3600);
  if (hours >= 24) {
    const days = Math.ceil(hours / 24);
    return `${days}d left`;
  }

  if (hours >= 1) return `${hours}h left`;

  const minutes = Math.max(1, Math.floor(secondsLeft / 60));
  return `${minutes}m left`;
}

export function PostedTaskCard({ task }: PostedTaskCardProps) {
  const now = Date.now() / 1000;
  const isExpired = now > Number(task.deadline);
  const isFilled = task.submissionCount >= task.workersRequired;
  const progress = Number(task.submissionCount);
  const required = Number(task.workersRequired);
  const percentage = required > 0 ? Math.min(100, (progress / required) * 100) : 0;

  const badgeVariant = task.resolved ? "resolved" : isExpired ? "expired" : "open";
  const badgeText = task.resolved
    ? "Resolved"
    : isExpired
    ? "Expired"
    : isFilled
    ? "Ready to Resolve"
    : "Collecting Answers";

  return (
    <div className="glass-hover p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">Task #{task.id.toString()}</p>
          <p className="font-semibold text-white text-sm line-clamp-2">
            {task.metadata?.question ?? "Question metadata loading…"}
          </p>
        </div>
        <Badge variant={badgeVariant}>{badgeText}</Badge>
      </div>

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

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="text-slate-500 mb-1">Locked Funds</p>
          <p className="font-semibold text-white">{formatEther(task.totalFunds)} ETH</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="text-slate-500 mb-1">Base Escrow / Worker</p>
          <p className="font-semibold text-white">{formatEther(task.rewardPerWorker)} ETH</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>
            {progress}/{required} submissions
          </span>
          <span className="text-slate-400">{formatDeadline(task.deadline)}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-accent-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
