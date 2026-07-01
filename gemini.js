import { GoogleGenAI } from "@google/genai";

const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

let currentKey = 0;

function getClient() {
  const apiKey = apiKeys[currentKey];
  currentKey = (currentKey + 1) % apiKeys.length;

  return new GoogleGenAI({ apiKey });
}

export async function generate(prompt) {
  let lastError;

  for (let i = 0; i < apiKeys.length; i++) {
    try {
      const ai = getClient();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (err) {
      lastError = err;
      console.log(`API Key ${i + 1} failed. Trying next key...`);
    }
  }

  throw lastError || new Error("All Gemini API keys failed.");
}