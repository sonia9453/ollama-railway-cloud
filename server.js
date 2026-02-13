const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());


// 🔹 Railway 必須使用 process.env.PORT
const PORT = process.env.PORT || 3000;
if (!PORT) {
  console.error("❌ process.env.PORT not set!"); 
  process.exit(1);
}


const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;


// 🔹 啟動時檢查 API Key
if (!OLLAMA_API_KEY) {
  console.error("❌ OLLAMA_API_KEY is NOT set! Please configure it in Railway.");
} else {
  console.log("✅ OLLAMA_API_KEY is set (hidden)");
}

// 🔹 Healthcheck endpoint（保證 container 一啟動就回應）
app.get("/health", (req, res) => res.send("OK"));

// 🔹 Version endpoint（方便確認最新 commit / 版本）
app.get("/version", (req, res) => {
  res.json({ version: "2026-02-13 server.js update" });
});

// 🔹 Chat Proxy
app.post("/api/chat", async (req, res) => {
  if (!OLLAMA_API_KEY) {
    return res.status(500).json({ error: "Server missing OLLAMA_API_KEY" });
  }

  try {
    const response = await axios.post(
      "https://ollama.com/api/chat",
      { ...req.body, stream: false },
      {
        headers: {
          Authorization: `Bearer ${OLLAMA_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error("❌ Ollama Cloud Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// 🔹 啟動服務，0.0.0.0 保證外部可訪問
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Proxy Server running on port ${PORT}`);
  console.log("PORT=", process.env.PORT);
});
