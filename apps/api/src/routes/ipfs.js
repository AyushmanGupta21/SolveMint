const express = require("express");
const multer  = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Validate PINATA_JWT exists and return it, or send a 503. */
function requireJWT(res) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    res.status(503).json({
      error: "PINATA_JWT not configured. Add it to your .env file.",
      hint: "Get your JWT at https://app.pinata.cloud → API Keys → New Key",
    });
    return null;
  }
  return jwt;
}

/** Pin a file buffer to Pinata and return the IPFS hash. */
async function pinFile(jwt, buffer, filename, mimetype) {
  const FormData = (await import("form-data")).default;
  const fetch    = (await import("node-fetch")).default;

  const form = new FormData();
  form.append("file", buffer, { filename, contentType: mimetype });
  form.append(
    "pinataMetadata",
    JSON.stringify({ name: filename })
  );

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method:  "POST",
    headers: { Authorization: `Bearer ${jwt}`, ...form.getHeaders() },
    body:    form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinata file error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.IpfsHash;
}

/** Pin a JSON object to Pinata and return the IPFS hash. */
async function pinJSON(jwt, obj, name = "task-metadata") {
  const fetch = (await import("node-fetch")).default;

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent:  obj,
      pinataMetadata: { name },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinata JSON error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.IpfsHash;
}

// ── GET /api/ipfs/test ────────────────────────────────────────────────────────
// Verifies the Pinata JWT is configured and valid without uploading anything.

router.get("/test", async (req, res) => {
  const jwt = requireJWT(res);
  if (!jwt) return;

  try {
    const fetch = (await import("node-fetch")).default;
    const r = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (!r.ok) {
      const body = await r.text();
      return res.status(401).json({
        ok:    false,
        error: `Pinata rejected the JWT (${r.status}): ${body}`,
      });
    }

    const data = await r.json();
    return res.json({ ok: true, message: data.message ?? "Authenticated" });
  } catch (err) {
    console.error("[IPFS] Auth test error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ── POST /api/ipfs/upload ─────────────────────────────────────────────────────
// Accepts: multipart/form-data with optional `file` + required `metadata` JSON.
// Returns: { cid: string }

router.post("/upload", upload.single("file"), async (req, res) => {
  const jwt = requireJWT(res);
  if (!jwt) return;

  try {
    const metadata = JSON.parse(req.body.metadata || "{}");

    // 1. Pin the uploaded file (if any) and embed the gateway URL
    if (req.file) {
      const hash = await pinFile(
        jwt,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      metadata.contentUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
      console.log(`[IPFS] File pinned → ${hash}`);
    }

    // 2. Pin the metadata JSON
    const metadataHash = await pinJSON(jwt, metadata);
    console.log(`[IPFS] Metadata pinned → ${metadataHash}`);

    return res.json({
      cid:    metadataHash,
      url:    `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
    });
  } catch (err) {
    console.error("[IPFS] Upload error:", err);
    return res.status(500).json({ error: err.message ?? "Upload failed" });
  }
});

module.exports = router;
