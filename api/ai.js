export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    const API_KEY = process.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY MISSING" });
    }

    // ⭐ Using Mistral 7B - The most stable free model on OpenRouter
    const model = "mistralai/mistral-7b-instruct:free";
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: "Provider Error", 
        message: data.error?.message || "Unknown error" 
      });
    }

    const reply = data.choices?.[0]?.message?.content || "No response received.";
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: "Crash: " + error.message });
  }
}
