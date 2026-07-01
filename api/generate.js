import OpenAI from "openai";

console.log("Function Started");
console.log("API KEY:", process.env.DEEPSEEK_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt is required"
    });
  }

  // Your AI code here...
}

export default async function handler(req, res) {
  try {
    console.log("Function Started");

    console.log("API KEY Exists:", !!process.env.DEEPSEEK_API_KEY);

    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

console.log("Method:", req.method);
console.log("Headers:", req.headers);
console.log("Body:", req.body);

const { prompt } = req.body;

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return res.status(200).json(response);
  } catch (err) {
    console.error("FULL ERROR:", err);

    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
}