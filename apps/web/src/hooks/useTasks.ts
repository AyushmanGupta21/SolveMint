import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { SOLVEMINT_ABI, SOLVEMINT_ADDRESS } from "@/lib/contract";
import { fetchTaskMetadata } from "@/lib/ipfs";
import type { TaskInfo, TaskMetadata } from "@/types";

/**
 * Fetches all tasks from the contract and enriches each with IPFS metadata.
 * Returns tasks in reverse order (newest first).
 */
export function useTaskList() {
  const { data: taskCount, isLoading: countLoading } = useReadContract({
    address: SOLVEMINT_ADDRESS,
    abi: SOLVEMINT_ABI,
    functionName: "taskCount",
  });

  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskCount === undefined) return;

    const count = Number(taskCount);
    if (count === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // IDs newest-first
    const ids = Array.from({ length: count }, (_, i) => BigInt(count - i));
    setLoading(true);

    // Individual tasks are fetched per-component via TaskFetcher to avoid
    // calling hooks inside loops. This hook only exposes the id list.
    setTasks(ids.map((id) => ({ id } as TaskInfo)));
    setLoading(false);
  }, [taskCount]);

  return { tasks, taskCount: taskCount ?? 0n, loading: countLoading || loading };
}

/**
 * Fetches a single task from the contract + its IPFS metadata.
 */
export function useSingleTask(taskId: bigint) {
  const [metadata, setMetadata] = useState<TaskMetadata | undefined>();

  const { data, isLoading } = useReadContract({
    address: SOLVEMINT_ADDRESS,
    abi: SOLVEMINT_ABI,
    functionName: "tasks",
    args: [taskId],
  });

  useEffect(() => {
    if (!data) return;
    const cid = data[1] as string;
    fetchTaskMetadata(cid)
      .then(setMetadata)
      .catch(() => undefined);
  }, [data]);

  if (!data) return { task: null, isLoading };

  const task: TaskInfo = {
    id: taskId,
    company: data[0] as string,
    metadataCID: data[1] as string,
    optionCount: data[2] as number,
    workersRequired: data[3] as bigint,
    rewardPerWorker: data[4] as bigint,
    deadline: data[5] as bigint,
    totalFunds: data[6] as bigint,
    resolved: data[7] as boolean,
    refunded: data[8] as boolean,
    submissionCount: data[9] as bigint,
    metadata,
  };

  return { task, isLoading };
}
