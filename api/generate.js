import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com"
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed"
    });
  }

  try {

    const { prompt } = req.body;

    const response = await client.chat.completions.create({

      model: "deepseek-chat",

      messages: [
        {
          role: "user",
          content: prompt
        }
      ],

      temperature: 0.3

    });

    res.status(200).json(response);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

}