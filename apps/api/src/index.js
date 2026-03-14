const express  = require("express");
const multer   = require("multer");
const cors     = require("cors");
require("dotenv").config({ path: "../../.env" });

const app    = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

// ── IPFS upload (Pinata) ─────────────────────────────────────────────────────

app.post("/api/ipfs/upload", upload.single("file"), async (req, res) => {
  const PINATA_JWT = process.env.PINATA_JWT;

  if (!PINATA_JWT) {
    return res.status(503).json({
      error: "PINATA_JWT not configured. Set it in .env to enable IPFS uploads.",
    });
  }

  try {
    const { default: fetch } = await import("node-fetch");
    const metadata = JSON.parse(req.body.metadata || "{}");

    // If a file was uploaded, pin it first and embed the resulting CID in metadata
    if (req.file) {
      const fileForm = new (await import("form-data")).default();
      fileForm.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const fileRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...fileForm.getHeaders(),
        },
        body: fileForm,
      });

      if (!fileRes.ok) throw new Error("Pinata file upload failed");
      const fileJson = await fileRes.json();
      metadata.contentUrl = `https://gateway.pinata.cloud/ipfs/${fileJson.IpfsHash}`;
    }

    // Pin JSON metadata
    const jsonRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pinataContent: metadata }),
    });

    if (!jsonRes.ok) throw new Error("Pinata JSON upload failed");
    const jsonData = await jsonRes.json();

    return res.json({ cid: jsonData.IpfsHash });
  } catch (err) {
    console.error("IPFS upload error:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : "Upload failed" });
  }
});

// ── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SolveMint API running on http://localhost:${PORT}`);
});
