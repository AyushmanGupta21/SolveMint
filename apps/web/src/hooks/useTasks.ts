import { useEffect, useMemo, useState } from "react";
import { useReadContract, useReadContracts } from "wagmi";
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

/**
 * Fetches tasks posted by a specific company wallet and enriches with metadata.
 */
export function useCompanyTasks(companyAddress?: string) {
  const normalizedCompany = companyAddress?.toLowerCase() ?? "";

  const { data: taskCount, isLoading: countLoading } = useReadContract({
    address: SOLVEMINT_ADDRESS,
    abi: SOLVEMINT_ABI,
    functionName: "taskCount",
  });

  const ids = useMemo(() => {
    if (!taskCount) return [] as bigint[];
    const count = Number(taskCount);
    return Array.from({ length: count }, (_, i) => BigInt(count - i));
  }, [taskCount]);

  const contracts = useMemo(
    () =>
      ids.map((id) => ({
        address: SOLVEMINT_ADDRESS,
        abi: SOLVEMINT_ABI,
        functionName: "tasks" as const,
        args: [id] as const,
      })),
    [ids]
  );

  const { data: taskResults, isLoading: tasksLoading } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  });

  const [metadataMap, setMetadataMap] = useState<Record<string, TaskMetadata | undefined>>({});
  const [metadataLoading, setMetadataLoading] = useState(false);

  const companyTasksBase = useMemo(() => {
    if (!taskResults || !normalizedCompany) return [] as TaskInfo[];

    return taskResults
      .map((result, index) => {
        if (result.status !== "success" || !result.result) return null;

        const data = result.result as readonly [
          string,
          string,
          number,
          bigint,
          bigint,
          bigint,
          bigint,
          boolean,
          boolean,
          bigint
        ];

        const company = data[0];
        if (company.toLowerCase() !== normalizedCompany) return null;

        return {
          id: ids[index],
          company,
          metadataCID: data[1],
          optionCount: Number(data[2]),
          workersRequired: data[3],
          rewardPerWorker: data[4],
          deadline: data[5],
          totalFunds: data[6],
          resolved: data[7],
          refunded: data[8],
          submissionCount: data[9],
        } satisfies TaskInfo;
      })
      .filter((task): task is TaskInfo => task !== null);
  }, [taskResults, ids, normalizedCompany]);

  useEffect(() => {
    if (!companyTasksBase.length) {
      setMetadataMap({});
      setMetadataLoading(false);
      return;
    }

    let cancelled = false;
    setMetadataLoading(true);

    Promise.all(
      companyTasksBase.map(async (task) => {
        try {
          const metadata = await fetchTaskMetadata(task.metadataCID);
          return [task.id.toString(), metadata] as const;
        } catch {
          return [task.id.toString(), undefined] as const;
        }
      })
    )
      .then((entries) => {
        if (cancelled) return;
        setMetadataMap(Object.fromEntries(entries));
      })
      .finally(() => {
        if (!cancelled) setMetadataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [companyTasksBase]);

  const tasks = useMemo(
    () =>
      companyTasksBase.map((task) => ({
        ...task,
        metadata: metadataMap[task.id.toString()],
      })),
    [companyTasksBase, metadataMap]
  );

  return {
    tasks,
    loading: countLoading || tasksLoading || metadataLoading,
    taskCount: taskCount ?? 0n,
  };
}
