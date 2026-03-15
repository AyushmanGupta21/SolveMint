"use client";

import { Card, SummaryRow } from "@/components/ui/Card";
import { StatusMessage } from "@/components/ui/StatusMessage";
import type { TaskFormState, TxStatus } from "@/types";

interface TaskSummaryPanelProps {
  form: TaskFormState;
  status: TxStatus;
  errorMsg: string;
  txHash: string;
  explorerUrl: string;
  onSubmit: () => void;
  address: string;
}

export function TaskSummaryPanel({
  form,
  status,
  errorMsg,
  txHash,
  explorerUrl,
  onSubmit,
  address,
}: TaskSummaryPanelProps) {
  const validOptions = form.options.filter(Boolean);
  const workers = Number.parseInt(form.workers || "0", 10) || 0;
  const totalEth = parseFloat(form.reward || "0") || 0;
  const basePerWorker = workers > 0 ? totalEth / workers : 0;
  const workersValid = workers >= 3;

  return (
    <div className="flex flex-col gap-6">
      {/* Cost summary */}
      <div className="relative z-0 group">
        <div className="absolute -inset-px bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#a855f7] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500 -z-10"></div>
        <Card padding="p-5" className="relative z-10 !border-white/10">
          <h2 className="font-bold text-white mb-4 text-[13px] tracking-widest uppercase">
            TRANSACTION SUMMARY
          </h2>
        <div className="space-y-2.5">
          <SummaryRow label="Workers" value={form.workers || "—"} />
          <SummaryRow label="Total budget" value={`${totalEth.toFixed(4)} ETH`} />
          <SummaryRow label="Base escrow / worker" value={`${basePerWorker.toFixed(4)} ETH`} />
          <SummaryRow label="Deadline" value={`${form.hours || "0"} hours`} />
          <SummaryRow label="Options" value={validOptions.length.toString()} />
          <div className="border-t border-[#333333] pt-3 my-1">
            <SummaryRow
              label="Total locked"
              value={`${totalEth.toFixed(4)} ETH`}
              highlight
            />
          </div>
        </div>

        {!workersValid && (
          <StatusMessage variant="error" className="mt-3">
            Workers required must be at least 3.
          </StatusMessage>
        )}

        {/* Status feedback */}
        {(status === "txn" || status === "pending") && (
          <StatusMessage variant="info" className="mt-3">
            {status === "txn"
              ? "Waiting for wallet confirmation. Please approve in MetaMask."
              : txHash
              ? (
                <>
                  Transaction submitted. Waiting for confirmation. {" "}
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-[#4a478a]"
                  >
                    View on explorer
                  </a>
                </>
              )
              : "Transaction submitted. Waiting for confirmation."}
          </StatusMessage>
        )}
        {status === "error" && (
          <StatusMessage variant="error" className="mt-3">
            {errorMsg}
          </StatusMessage>
        )}
        {status === "done" && txHash && (
          <StatusMessage variant="success" className="mt-3">
            ✅ Task created!{" "}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="underline text-[#4a478a]"
            >
              View on explorer
            </a>
          </StatusMessage>
        )}

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={
            status === "uploading" ||
            status === "txn" ||
            status === "pending" ||
            !form.question ||
            validOptions.length < 2 ||
            !workersValid
          }
          className="w-1/2 min-w-fit mt-4 flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "uploading" || status === "pending" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          ) : status === "txn" ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          ) : null}
          <span>
            {status === "uploading"
              ? "Uploading…"
              : status === "txn"
              ? "Waiting tx…"
              : status === "pending"
              ? "Confirming…"
              : "Deploy Task"}
          </span>
        </button>
        </Card>
      </div>
    </div>
  );
}
