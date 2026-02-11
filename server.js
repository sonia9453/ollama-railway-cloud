const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

app.post("/chat", async (req, res) => {
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
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
