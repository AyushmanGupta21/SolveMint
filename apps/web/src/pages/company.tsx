"use client";

import { useState, useCallback } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { SOLVEMINT_ABI, SOLVEMINT_ADDRESS } from "@/lib/contract";
import { uploadTaskMetadata } from "@/lib/ipfs";

// ── Types ────────────────────────────────────────────────────────────────────

interface TaskFormState {
  contentType: "image" | "text";
  imageFile:   File | null;
  imagePreview:string;
  contentText: string;
  question:    string;
  options:     string[];
  workers:     string;
  reward:      string;   // in ETH
  hours:       string;   // deadline in hours from now
}

const INITIAL_FORM: TaskFormState = {
  contentType:  "image",
  imageFile:    null,
  imagePreview: "",
  contentText:  "",
  question:     "",
  options:      ["", ""],
  workers:      "3",
  reward:       "0.001",
  hours:        "24",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function CompanyPage() {
  const { address, isConnected } = useAccount();
  const [form, setForm] = useState<TaskFormState>(INITIAL_FORM);
  const [status, setStatus] = useState<"idle" | "uploading" | "txn" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  const { writeContractAsync } = useWriteContract();

  // Read total task count
  const { data: taskCount } = useReadContract({
    address: SOLVEMINT_ADDRESS,
    abi: SOLVEMINT_ABI,
    functionName: "taskCount",
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, imageFile: file, imagePreview: url }));
  }

  function handleOption(idx: number, value: string) {
    setForm((f) => {
      const opts = [...f.options];
      opts[idx] = value;
      return { ...f, options: opts };
    });
  }

  function addOption() {
    if (form.options.length >= 10) return;
    setForm((f) => ({ ...f, options: [...f.options, ""] }));
  }

  function removeOption(idx: number) {
    if (form.options.length <= 2) return;
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, i) => i !== idx),
    }));
  }

  const handleSubmit = useCallback(async () => {
    if (!isConnected) return;
    setStatus("uploading");
    setErrorMsg("");

    try {
      // 1. Upload metadata to IPFS (or fake local encoding)
      const cid = await uploadTaskMetadata(
        {
          question:    form.question,
          options:     form.options.filter(Boolean),
          contentText: form.contentText,
          contentUrl:  form.imagePreview, // localObjectURL or real URL
          contentType: form.contentType,
        },
        form.imageFile ?? undefined
      );

      // 2. Calculate values
      const workers      = BigInt(form.workers || "1");
      const rewardWei    = parseEther(form.reward || "0.001");
      const totalWei     = workers * rewardWei;
      const deadlineSecs = BigInt(Math.floor(Date.now() / 1000) + Number(form.hours) * 3600);
      const options      = form.options.filter(Boolean);

      setStatus("txn");

      // 3. Call smart contract
      const hash = await writeContractAsync({
        address: SOLVEMINT_ADDRESS,
        abi: SOLVEMINT_ABI,
        functionName: "createTask",
        args: [cid, options.length as number, workers, rewardWei, deadlineSecs],
        value: totalWei,
      });

      setTxHash(hash);
      setStatus("done");
      setForm(INITIAL_FORM);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.split("\n")[0]);
      setStatus("error");
    }
  }, [form, isConnected, writeContractAsync]);

  const validOptions = form.options.filter(Boolean);
  const totalEth =
    parseFloat(form.reward || "0") * parseFloat(form.workers || "0");

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
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Company Dashboard
            </h1>
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
              {/* ── Form ── */}
              <div className="lg:col-span-3 glass p-6 flex flex-col gap-6">
                <h2 className="font-bold text-white text-lg border-b border-white/10 pb-4">
                  New Task
                </h2>

                {/* Content type */}
                <div>
                  <label className="label">Content Type</label>
                  <div className="flex gap-3">
                    {(["image", "text"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, contentType: t }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                          form.contentType === t
                            ? "border-brand-500 bg-brand-500/20 text-brand-300"
                            : "border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {t === "image" ? "🖼  Image" : "📝  Text"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dataset content */}
                {form.contentType === "image" ? (
                  <div>
                    <label className="label">Upload Image</label>
                    <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-brand-500/50 transition-colors bg-white/[0.02]">
                      {form.imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={form.imagePreview} alt="preview" className="h-full w-full object-contain rounded-xl" />
                      ) : (
                        <span className="text-slate-500 text-sm">Click to upload image</span>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="label">Text Content</label>
                    <textarea
                      className="input-field h-24 resize-none"
                      placeholder="Paste the text to label…"
                      value={form.contentText}
                      onChange={(e) => setForm((f) => ({ ...f, contentText: e.target.value }))}
                    />
                  </div>
                )}

                {/* Question */}
                <div>
                  <label className="label">Question</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Is this image a cat or a dog?"
                    value={form.question}
                    onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="label">Answer Options</label>
                  <div className="flex flex-col gap-2">
                    {form.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-slate-500 text-xs font-mono w-5 text-center">{idx + 1}</span>
                        <input
                          className="input-field"
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={(e) => handleOption(idx, e.target.value)}
                        />
                        {form.options.length > 2 && (
                          <button
                            onClick={() => removeOption(idx)}
                            className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {form.options.length < 10 && (
                      <button
                        onClick={addOption}
                        className="text-brand-400 hover:text-brand-300 text-xs font-semibold py-1"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                </div>

                {/* Workers / Reward / Deadline */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Workers Required</label>
                    <input
                      type="number" min="1"
                      className="input-field"
                      value={form.workers}
                      onChange={(e) => setForm((f) => ({ ...f, workers: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Reward / Worker (ETH)</label>
                    <input
                      type="number" step="0.0001" min="0.0001"
                      className="input-field"
                      value={form.reward}
                      onChange={(e) => setForm((f) => ({ ...f, reward: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Deadline (hours)</label>
                    <input
                      type="number" min="1"
                      className="input-field"
                      value={form.hours}
                      onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* ── Preview / Summary ── */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                {/* Cost summary */}
                <div className="glass p-5">
                  <h2 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">
                    Transaction Summary
                  </h2>
                  <div className="space-y-3 text-sm">
                    <Row label="Workers" value={form.workers || "—"} />
                    <Row label="Reward each" value={`${form.reward || "0"} ETH`} />
                    <Row label="Deadline" value={`${form.hours || "0"} hours`} />
                    <Row label="Options" value={validOptions.length.toString()} />
                    <div className="border-t border-white/10 pt-3">
                      <Row
                        label="Total locked"
                        value={`${totalEth.toFixed(4)} ETH`}
                        highlight
                      />
                    </div>
                  </div>

                  {/* Status */}
                  {status === "error" && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs break-all">
                      {errorMsg}
                    </div>
                  )}
                  {status === "done" && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs break-all">
                      ✅ Task created!{" "}
                      <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        View tx
                      </a>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    onClick={handleSubmit}
                    disabled={
                      status === "uploading" ||
                      status === "txn" ||
                      !form.question ||
                      validOptions.length < 2
                    }
                    className="btn-primary w-full mt-5"
                  >
                    {status === "uploading"
                      ? "⏳ Uploading to IPFS…"
                      : status === "txn"
                      ? "⛓  Waiting for tx…"
                      : "🔒 Lock Funds & Deploy Task"}
                  </button>
                </div>

                {/* Wallet info */}
                <div className="glass p-5 text-xs text-slate-500">
                  <p className="font-semibold text-slate-400 mb-1">Connected Wallet</p>
                  <p className="font-mono break-all">{address}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? "text-accent-400 font-bold" : "text-white font-medium"}>
        {value}
      </span>
    </div>
  );
}
