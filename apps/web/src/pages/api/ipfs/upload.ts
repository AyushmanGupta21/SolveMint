import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { type Fields, type Files } from "formidable";
import { readFile } from "node:fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

function requireJWT(res: NextApiResponse): string | null {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    res.status(503).json({
      error: "PINATA_JWT not configured.",
      hint: "Set PINATA_JWT in your Vercel Project Environment Variables.",
    });
    return null;
  }
  return jwt;
}

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  const form = formidable({
    multiples: false,
    maxFileSize: 20 * 1024 * 1024,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err: unknown, fields: Fields, files: Files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

async function pinFile(jwt: string, buffer: Buffer, filename: string, mimetype?: string) {
  const bytes = Uint8Array.from(buffer);
  const form = new FormData();
  form.append(
    "file",
    new Blob([bytes], { type: mimetype || "application/octet-stream" }),
    filename
  );
  form.append("pinataMetadata", JSON.stringify({ name: filename }));

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Pinata file error (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { IpfsHash: string };
  return data.IpfsHash;
}

async function pinJSON(jwt: string, content: unknown, name = "task-metadata") {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: content,
      pinataMetadata: { name },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Pinata JSON error (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { IpfsHash: string };
  return data.IpfsHash;
}

function getFirstFieldValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const jwt = requireJWT(res);
  if (!jwt) return;

  try {
    const { fields, files } = await parseForm(req);

    const metadataRaw = getFirstFieldValue(fields.metadata as string | string[] | undefined);
    if (!metadataRaw) {
      return res.status(400).json({ error: "Missing metadata field" });
    }

    const metadata = JSON.parse(metadataRaw) as {
      contentUrl?: string;
      [key: string]: unknown;
    };

    const fileInput = files.file;
    const file = Array.isArray(fileInput) ? fileInput[0] : fileInput;

    if (file) {
      const fileBuffer = await readFile(file.filepath);
      const fileHash = await pinFile(
        jwt,
        fileBuffer,
        file.originalFilename || "upload.bin",
        file.mimetype || undefined
      );
      metadata.contentUrl = `https://gateway.pinata.cloud/ipfs/${fileHash}`;
    }

    const metadataHash = await pinJSON(jwt, metadata);

    return res.status(200).json({
      cid: metadataHash,
      url: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message || "Upload failed" });
  }
}
