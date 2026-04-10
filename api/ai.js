export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    const API_KEY = process.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is missing." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://risel-ai.vercel.app",
        "X-Title": "Risel AI"
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5-8b:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "OpenRouter Error", 
        detail: data.error?.message || "Unknown error",
        raw: data
      });
    }

    const reply = data.choices?.[0]?.message?.content || "No response received.";
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: "Server crash: " + error.message });
  }
}
