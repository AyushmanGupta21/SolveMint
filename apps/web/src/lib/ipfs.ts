// Lightweight IPFS helper — uses the backend API when available,
// falls back to encoding as a data URL for the local demo.

const API_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
    : "";

export interface TaskMetadata {
  question:    string;
  options:     string[];
  contentUrl:  string;   // image URL or empty string for text tasks
  contentText: string;   // raw text for text tasks
  contentType: "image" | "text";
}

/**
 * Upload task metadata (and optionally a file) to IPFS via the Express API.
 * Falls back to a fake CID containing the JSON directly (base64-encoded) so
 * the frontend works without the API during local Hardhat demos.
 */
export async function uploadTaskMetadata(
  metadata: TaskMetadata,
  file?: File
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("metadata", JSON.stringify(metadata));
    if (file) formData.append("file", file);

    const res = await fetch(`${API_URL}/api/ipfs/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("API upload failed");
    const data = await res.json();
    return data.cid as string;
  } catch {
    // Fallback: encode metadata as base64 "fake CID" prefixed with "local:"
    const encoded = btoa(JSON.stringify(metadata));
    return `local:${encoded}`;
  }
}

/**
 * Fetch task metadata from IPFS (or decode fake local CID).
 */
export async function fetchTaskMetadata(cid: string): Promise<TaskMetadata> {
  if (cid.startsWith("local:")) {
    const encoded = cid.slice(6);
    return JSON.parse(atob(encoded)) as TaskMetadata;
  }

  const gateway =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";
  const res = await fetch(`${gateway}/${cid}`);
  if (!res.ok) throw new Error(`Failed to fetch metadata for CID: ${cid}`);
  return res.json() as Promise<TaskMetadata>;
}
