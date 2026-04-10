export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    const API_KEY = process.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      return res.status(200).json({ reply: "ERROR: API KEY MISSING." });
    }

    const modelsToTry = [
      "google/gemini-flash-1.5",
      "google/gemini-2.0-flash-exp",
      "meta-llama/llama-3.1-8b-instruct"
    ];

    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://risel-ai.vercel.app",
            "X-Title": "Risel AI"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { 
                role: "system", 
                content: "You are Risel, a high-end Agentic AI Career Coach inspired by Antigravity. RULES: 1. Mirror the user's language. 2. NEVER provide translations in brackets or parentheses. EXAMPLE INCORRECT: Namaste (Hello)! main Risel hoon (I am Risel). EXAMPLE CORRECT: Namaste! Main Risel hoon. Aap kaise hain? 3. Be proactive and suggest next steps. 4. Use bold text and emojis. 5. No 'Dear friend' or 'Suno'." 
              },
              { role: "user", content: prompt }
            ]
          })
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
          lastError = data.error?.message || "Unknown Error";
          continue;
        }
      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    return res.status(200).json({ reply: "⚠️ Connection error. Please try again." });

  } catch (error) {
    return res.status(200).json({ reply: "CRASH: " + error.message });
  }
}
