import type { NextApiRequest, NextApiResponse } from "next";

function requireJWT(res: NextApiResponse): string | null {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    res.status(503).json({
      ok: false,
      error: "PINATA_JWT not configured.",
      hint: "Set PINATA_JWT in your Vercel Project Environment Variables.",
    });
    return null;
  }
  return jwt;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const jwt = requireJWT(res);
  if (!jwt) return;

  try {
    const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (!response.ok) {
      const body = await response.text();
      return res.status(401).json({
        ok: false,
        error: `Pinata rejected the JWT (${response.status}): ${body}`,
      });
    }

    const data = (await response.json()) as { message?: string };
    return res.status(200).json({ ok: true, message: data.message ?? "Authenticated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ ok: false, error: message });
  }
}
