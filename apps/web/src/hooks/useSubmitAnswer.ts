import { useState } from "react";
import { useWriteContract } from "wagmi";
import { SOLVEMINT_ABI, SOLVEMINT_ADDRESS } from "@/lib/contract";
import type { TxStatus } from "@/types";

/**
 * Handles a worker submitting an answer to a labeling task.
 */
export function useSubmitAnswer() {
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<TxStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  async function submitAnswer(taskId: bigint, optionIndex: number) {
    setStatus("pending");
    setErrorMsg("");

    try {
      const hash = await writeContractAsync({
        address: SOLVEMINT_ADDRESS,
        abi: SOLVEMINT_ABI,
        functionName: "submitAnswer",
        args: [taskId, optionIndex],
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
  }

  function reset() {
    setStatus("idle");
    setErrorMsg("");
    setTxHash("");
  }

  return { submitAnswer, status, errorMsg, txHash, reset };
}
