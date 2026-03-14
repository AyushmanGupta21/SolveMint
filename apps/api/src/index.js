const express = require("express");
const cors    = require("cors");
require("dotenv").config({ path: "../../.env" });

const ipfsRouter = require("./routes/ipfs");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/ipfs", ipfsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", env: "testnet" }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[SolveMint API] Running on http://localhost:${PORT}`);
});
