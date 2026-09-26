import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ───────── MIDDLEWARE ─────────
app.use(cors());
app.use(express.json());

// ───────── API KEYS ─────────
const deepseekKeys = [
  process.env.DEEPSEEK_API_KEY_1,
  process.env.DEEPSEEK_API_KEY_2,
  process.env.DEEPSEEK_API_KEY_3,
].filter(Boolean);

const geminiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

// ───────── DEBUG: keys load hui ya nahi ─────────
console.log("─────────────────────────────");
console.log("DeepSeek keys loaded:", deepseekKeys.length);
console.log("Gemini keys loaded  :", geminiKeys.length);
console.log("─────────────────────────────");

if (deepseekKeys.length === 0 && geminiKeys.length === 0) {
  console.warn("⚠️  Koi bhi API key load nahi hui! .env file check karo.");
  console.warn("    File path hona chahiye:", path.join(__dirname, ".env"));
}

// ───────── DeepSeek ─────────
async function askDeepSeek(prompt) {
  let lastError;
  for (const key of deepseekKeys) {
    try {
      console.log("Trying DeepSeek...");
      const client = new OpenAI({
        apiKey: key,
        baseURL: "https://api.deepseek.com",
      });
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
      });
      return response.choices[0].message.content;
    } catch (err) {
      console.log("DeepSeek key failed:", err.message);
      lastError = err;
    }
  }
  throw lastError || new Error("No DeepSeek keys available");
}

// ───────── Gemini ─────────
async function askGemini(prompt) {
  let lastError;
  for (const key of geminiKeys) {
    try {
      console.log("Trying Gemini...");
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.log("Gemini key failed:", err.message);
      lastError = err;
    }
  }
  throw lastError || new Error("No Gemini keys available");
}

// ───────── API ROUTE ─────────
app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const answer = await askDeepSeek(prompt);
    return res.status(200).json({ provider: "DeepSeek", response: answer });
  } catch (deepErr) {
    console.log("DeepSeek failed. Switching to Gemini...");
    try {
      const answer = await askGemini(prompt);
      return res.status(200).json({ provider: "Gemini", response: answer });
    } catch (geminiErr) {
      return res.status(500).json({
        error: "All AI providers failed.",
        deepseek: deepErr.message,
        gemini: geminiErr.message,
      });
    }
  }
});

// ───────── STATIC FILES + HTML (API ke baad) ─────────
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ───────── LISTEN ─────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});