"use client";

import { formatEther } from "viem";
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
  const taskPool = task.workersRequired * task.rewardPerWorker;
  const formatEthClean = (val: bigint) => {
    const num = Number.parseFloat(formatEther(val));
    return Number.isInteger(num) ? num.toString() : num.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  };

const badgeVariant = task.resolved ? "resolved" : isExpired ? "expired" : isFilled ? "completed" : "open";
  const badgeText = task.resolved || isFilled
    ? "Completed"
    : isExpired
    ? "Expired"
    : "In Progress";

  return (
    <div className="relative z-0 group h-full">
      <div className="absolute -inset-px bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#a855f7] rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500 -z-10"></div>
      <div className="relative z-10 bg-[#1c1c1c] border border-white/5 hover:border-white/10 transition-all rounded-2xl p-6 flex flex-col gap-5 h-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[#888888] text-[13px] font-medium tracking-wide mb-1">Task #{task.id.toString()}</p>
            <p className="font-semibold text-white text-[15px] line-clamp-2 leading-snug">
              {task.metadata?.question ?? "Question metadata loading…"}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-full border border-white/10 bg-[#0f0f0f] px-3 py-1 flex items-center min-w-[max-content]">
            {(badgeVariant === "open" || badgeVariant === "completed" || badgeVariant === "resolved") && (
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#9333ea] to-[#a855f7] transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            )}
            {badgeVariant === "expired" && (
              <div className="absolute left-0 top-0 bottom-0 bg-red-500/20 w-full" />
            )}
            <span className="relative z-10 text-[11px] font-bold text-white tracking-widest uppercase drop-shadow-md">
              {badgeText}
            </span>
          </div>
      </div>

      {task.metadata?.contentType === "image" && task.metadata.contentUrl && (
        <div className="relative rounded-xl overflow-hidden h-32 w-full border border-white/5 bg-[#0f0f0f]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={task.metadata.contentUrl}
            alt="task content"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {task.metadata?.contentType === "text" && task.metadata.contentText && (
        <p className="text-[#BBBBBB] text-[13px] bg-[#0f0f0f] border border-white/5 rounded-xl p-4 line-clamp-3">
          {task.metadata.contentText}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 text-[13px]">
        <div className="rounded-xl border border-white/5 bg-[#161616] p-4">
          <p className="text-[#888888] mb-1.5">Task Budget</p>
          <p className="font-semibold bg-gradient-to-r from-[#a855f7] to-[#e9d5ff] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">{formatEthClean(taskPool)} ETH</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#161616] p-4">
          <p className="text-[#888888] mb-1.5">Base Escrow / Worker</p>
          <p className="font-semibold bg-gradient-to-r from-[#a855f7] to-[#e9d5ff] text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">{formatEthClean(task.rewardPerWorker)} ETH</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[13px] text-[#888888] mb-2 font-medium">
          <span>
            {progress}/{required} submissions
          </span>
          <span className="text-[#BBBBBB]">{formatDeadline(task.deadline)}</span>
        </div>
        <div className="h-2 bg-[#0f0f0f] border border-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#a855f7] to-[#e9d5ff] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
