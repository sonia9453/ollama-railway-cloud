const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

// 🔹 檢查 API Key 是否設定
if (!OLLAMA_API_KEY) {
  console.error("❌ OLLAMA_API_KEY is NOT set! Please add it in Railway Environment Variables.");
} else {
  console.log("✅ OLLAMA_API_KEY is set (hidden for security)");
}

// 🔹 Healthcheck endpoint for Railway
app.get("/health", (req, res) => res.send("OK"));

// 🔹 /chat endpoint
app.post("/chat", async (req, res) => {
  if (!OLLAMA_API_KEY) {
    return res.status(500).json({ error: "Server missing API Key" });
  }

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

    res.json(response.data);
  } catch (error) {
    console.error("❌ Request to Ollama Cloud failed:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

// 🔹 使用 0.0.0.0 監聽，Railway Edge 才能訪問
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy Server running on port ${PORT}`);
});
