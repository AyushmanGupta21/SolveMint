import { useState, useCallback } from "react";
import { useWriteContract, useChainId } from "wagmi";
import { parseEther } from "viem";
import { SOLVEMINT_ABI, SOLVEMINT_ADDRESS } from "@/lib/contract";
import { uploadTaskMetadata } from "@/lib/ipfs";
import { explorerTxUrl, TASK_FORM_DEFAULTS } from "@/constants";
import type { TaskFormState, TxStatus } from "@/types";

export const INITIAL_FORM: TaskFormState = {
  contentType: "image",
  imageFile: null,
  imagePreview: "",
  contentText: "",
  question: "",
  options: ["", ""],
  workers: TASK_FORM_DEFAULTS.workers,
  reward: TASK_FORM_DEFAULTS.reward,
  hours: TASK_FORM_DEFAULTS.hours,
};

/**
 * Encapsulates all logic for creating a new labeling task:
 * IPFS upload → contract write → state management.
 */
export function useCreateTask() {
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<TxStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  const createTask = useCallback(
    async (form: TaskFormState) => {
      setStatus("uploading");
      setErrorMsg("");

      try {
        const cid = await uploadTaskMetadata(
          {
            question: form.question,
            options: form.options.filter(Boolean),
            contentText: form.contentText,
            contentUrl: form.imagePreview,
            contentType: form.contentType,
          },
          form.imageFile ?? undefined
        );

        const workers = BigInt(form.workers || "1");
        const rewardWei = parseEther(form.reward || "0.001");
        const totalWei = workers * rewardWei;
        const deadlineSecs = BigInt(
          Math.floor(Date.now() / 1000) + Number(form.hours) * 3600
        );
        const options = form.options.filter(Boolean);

        setStatus("txn");

        const hash = await writeContractAsync({
          address: SOLVEMINT_ADDRESS,
          abi: SOLVEMINT_ABI,
          functionName: "createTask",
          args: [cid, options.length as number, workers, rewardWei, deadlineSecs],
          value: totalWei,
        });

        setTxHash(hash);
        setStatus("done");
        return hash;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg(msg.split("\n")[0]);
        setStatus("error");
        return null;
      }
    },
    [writeContractAsync]
  );

  const explorerUrl = txHash ? explorerTxUrl(chainId, txHash) : "";

  return { createTask, status, errorMsg, txHash, explorerUrl, setStatus };
}
