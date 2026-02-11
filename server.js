const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

// 🔹 檢查 API Key 是否有設定
if (!OLLAMA_API_KEY) {
  console.error("❌ OLLAMA_API_KEY is NOT set! Please add it in Railway Environment Variables.");
} else {
  console.log("✅ OLLAMA_API_KEY is set (hidden for security)");
}

// 🔹 Healthcheck endpoint for Railway
app.get("/health", (req, res) => {
  res.send("OK");
});

// 🔹 Chat endpoint
app.post("/chat", async (req, res) => {
  if (!OLLAMA_API_KEY) {
    return res.status(500).json({ error: "Server missing API Key" });
  }

  console.log("📨 Received request:", JSON.stringify(req.body));

  try {
    const response = await axios.post(
      "https://api.ollama.com/v1/chat/completions",
      req.body,
      {
        headers: {
          "Authorization": `Bearer ${OLLAMA_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Ollama response received");
    res.json(response.data);
  } catch (error) {
    console.error("❌ Request to Ollama Cloud failed:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

// 🔹 監聽所有網卡，保證 Railway 可外部訪問
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy Server running on port ${PORT}`);
});
