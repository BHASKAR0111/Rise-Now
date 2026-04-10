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
      "google/gemini-flash-1.5:free",
      "google/gemini-2.0-flash-exp:free",
      "mistralai/mistral-7b-instruct:free"
    ];

    let lastError = "";

    for (const model of modelsToTry) {
      try {
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

        if (response.ok && data.choices?.[0]?.message?.content) {
          return res.status(200).json({ reply: data.choices[0].message.content, model_used: model });
        } else {
          lastError = data.error?.message || "Unknown error";
          console.log(`Model ${model} failed: ${lastError}`);
          continue; // Try next model
        }
      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    return res.status(200).json({ 
      reply: `⚠️ ALL MODELS FAILED. Last Error: ${lastError}. Please check your OpenRouter dashboard credits/status.` 
    });

  } catch (error) {
    return res.status(200).json({ reply: "CRASH: " + error.message });
  }
}
