import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// -------------------------
// DeepSeek API Keys
// -------------------------
const deepseekKeys = [
  process.env.DEEPSEEK_API_KEY_1,
  process.env.DEEPSEEK_API_KEY_2,
  process.env.DEEPSEEK_API_KEY_3,
].filter(Boolean);

// -------------------------
// Gemini API Keys
// -------------------------
const geminiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

// -------------------------
// DeepSeek Function
// -------------------------
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
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content;

    } catch (err) {
      console.log("DeepSeek key failed.");
      lastError = err;
    }
  }

  throw lastError;
}

// -------------------------
// Gemini Function
// -------------------------
async function askGemini(prompt) {
  let lastError;

  for (const key of geminiKeys) {
    try {
      console.log("Trying Gemini...");

      const genAI = new GoogleGenerativeAI(key);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const result = await model.generateContent(prompt);

      return result.response.text();

    } catch (err) {
      console.log("Gemini key failed.");
      lastError = err;
    }
  }

  throw lastError;
}

// -------------------------
// API Route
// -------------------------
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt is required",
    });
  }

  try {

    // 1️⃣ DeepSeek first
    const answer = await askDeepSeek(prompt);

    return res.status(200).json({
      provider: "DeepSeek",
      response: answer,
    });

  } catch (deepErr) {

    console.log("DeepSeek Failed. Switching to Gemini...");

    try {

      // 2️⃣ Gemini fallback
      const answer = await askGemini(prompt);

      return res.status(200).json({
        provider: "Gemini",
        response: answer,
      });

    } catch (geminiErr) {

      return res.status(500).json({
        error: "All AI providers failed.",
        deepseek: deepErr.message,
        gemini: geminiErr.message,
      });

    }

  }
}