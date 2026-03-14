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
    <div className="flex flex-col gap-5">
      {/* Cost summary */}
      <Card>
        <h2 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">
          Transaction Summary
        </h2>
        <div className="space-y-3">
          <SummaryRow label="Workers" value={form.workers || "—"} />
          <SummaryRow label="Total budget" value={`${totalEth.toFixed(4)} ETH`} />
          <SummaryRow label="Base escrow / worker" value={`${basePerWorker.toFixed(4)} ETH`} />
          <SummaryRow label="Deadline" value={`${form.hours || "0"} hours`} />
          <SummaryRow label="Options" value={validOptions.length.toString()} />
          <div className="border-t border-white/10 pt-3">
            <SummaryRow
              label="Total locked"
              value={`${totalEth.toFixed(4)} ETH`}
              highlight
            />
          </div>
        </div>

        {!workersValid && (
          <StatusMessage variant="error" className="mt-4">
            Workers required must be at least 3.
          </StatusMessage>
        )}

        {/* Status feedback */}
        {status === "error" && (
          <StatusMessage variant="error" className="mt-4">
            {errorMsg}
          </StatusMessage>
        )}
        {status === "done" && txHash && (
          <StatusMessage variant="success" className="mt-4">
            ✅ Task created!{" "}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              View on testnet explorer
            </a>
          </StatusMessage>
        )}

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={
            status === "uploading" ||
            status === "txn" ||
            !form.question ||
            validOptions.length < 2 ||
            !workersValid
          }
          className="btn-primary w-full mt-5"
        >
          {status === "uploading"
            ? "⏳ Uploading to IPFS…"
            : status === "txn"
            ? "⛓  Waiting for tx…"
            : "🔒 Lock Funds & Deploy Task"}
        </button>
      </Card>

      {/* Wallet info */}
      <Card padding="p-5">
        <p className="font-semibold text-slate-400 mb-1 text-xs">Connected Wallet</p>
        <p className="font-mono text-xs text-slate-500 break-all">{address}</p>
      </Card>
    </div>
  );
}
