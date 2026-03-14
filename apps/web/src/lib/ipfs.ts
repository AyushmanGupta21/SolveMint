/**
 * IPFS helper for SolveMint.
 *
 * Upload flow:
 *   1. Calls the Express API (/api/ipfs/upload) which pins to Pinata.
 *   2. If the API is unavailable or PINATA_JWT is missing, falls back to
 *      a base64 "local:" CID so the UI still works without Pinata.
 *
 * Fetch flow:
 *   1. Decodes "local:" CIDs directly in the browser.
 *   2. Tries the configured IPFS gateway, then a public fallback gateway.
 */

// ── Configuration ─────────────────────────────────────────────────────────────

const API_URL: string =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
    : "";

const PRIMARY_GATEWAY: string =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";

const FALLBACK_GATEWAY = "https://ipfs.io/ipfs";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TaskMetadata {
  question:    string;
  options:     string[];
  contentUrl:  string;   // image URL or empty string for text tasks
  contentText: string;   // raw text or empty string for image tasks
  contentType: "image" | "text";
}

export interface IpfsUploadResult {
  cid: string;
  url: string;
  mode: "pinata" | "local"; // tells the UI which mode was used
}

// ── Upload ────────────────────────────────────────────────────────────────────

/**
 * Upload task metadata (and optionally an image file) to IPFS via Pinata.
 * Falls back to an in-browser base64 encoding when the API is unreachable.
 *
 * @returns The CID string (either a real IPFS hash or a "local:…" fallback).
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
      body:   formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      // If Pinata JWT is simply missing, let the caller know clearly
      if (res.status === 503) {
        console.warn("[IPFS] Pinata JWT not configured — using local fallback.");
        return buildLocalCid(metadata);
      }
      throw new Error(err.error ?? "Upload failed");
    }

    const data = await res.json();
    return data.cid as string;
  } catch (err) {
    // Network error or API down — degrade gracefully
    console.warn("[IPFS] API unreachable, using local fallback:", err);
    return buildLocalCid(metadata);
  }
}

/** Encode metadata as a browser-side base64 "CID" for local demos. */
function buildLocalCid(metadata: TaskMetadata): string {
  return `local:${btoa(JSON.stringify(metadata))}`;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Resolve task metadata from an IPFS CID (or local fallback).
 * Tries the primary gateway first, then falls back to ipfs.io.
 */
export async function fetchTaskMetadata(cid: string): Promise<TaskMetadata> {
  // Local demo CID — decode directly
  if (cid.startsWith("local:")) {
    return JSON.parse(atob(cid.slice(6))) as TaskMetadata;
  }

  // Try primary gateway
  try {
    const res = await fetch(`${PRIMARY_GATEWAY}/${cid}`);
    if (res.ok) return res.json() as Promise<TaskMetadata>;
  } catch {
    // fall through to fallback
  }

  // Try public fallback gateway
  const res = await fetch(`${FALLBACK_GATEWAY}/${cid}`);
  if (!res.ok) throw new Error(`Could not fetch IPFS metadata for CID: ${cid}`);
  return res.json() as Promise<TaskMetadata>;
}

// ── Health check ──────────────────────────────────────────────────────────────

/**
 * Ping the API's Pinata test endpoint.
 * Returns true if Pinata is configured and the JWT is valid.
 */
export async function checkIpfsConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const res = await fetch(`${API_URL}/api/ipfs/test`);
    const data = await res.json();
    return {
      ok:      data.ok === true,
      message: data.message ?? data.error ?? "Unknown status",
    };
  } catch {
    return { ok: false, message: "API is unreachable" };
  }
}
