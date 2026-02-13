const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

// ✅ 啟動時檢查 API Key
if (!OLLAMA_API_KEY) {
  console.error("❌ OLLAMA_API_KEY is NOT set! Please configure it in Railway.");
} else {
  console.log("✅ OLLAMA_API_KEY is set (hidden)");
}

// ✅ Health check
app.get("/health", (req, res) => {
  res.send("OK");
});

// ✅ Proxy endpoint
app.post("/api/chat", async (req, res) => {

  // 🔒 每次請求前再檢查一次（避免空值）
  if (!OLLAMA_API_KEY) {
    return res.status(500).json({
      error: "Server missing OLLAMA_API_KEY"
    });
  }

  try {
    const response = await axios.post(
      "https://ollama.com/api/chat",
      {
        ...req.body,
        stream: false // 建議關閉 streaming（比較穩定）
      },
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

    res.status(error.response?.status || 500).json(
      error.response?.data || { error: error.message }
    );
  }
});

// ✅ 啟動 server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Proxy running on port ${PORT}`);
});
