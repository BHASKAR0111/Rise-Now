export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, history = [] } = req.body;
    const API_KEY = process.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      return res.status(200).json({ reply: "ERROR: API KEY MISSING." });
    }

    // 🏗️ ARCHITECTURE: Intent Detection & Memory-Augmented Prompting
    const systemPrompt = `You are Risel, an Agentic AI Career Coach. 
INTERNAL WORKFLOW:
1. INTENT DETECTION: First, identify if the user wants a Roadmap, Interview Prep, Jobs, or general Career Advice.
2. MEMORY UPDATE: Use the provided conversation history to maintain context.
3. PROMPT BUILDER: Based on intent and memory, construct a professional but warm response.

RULES:
- NO EMOJIS.
- MIRROR user language exactly (English/Hindi/Hinglish).
- NO translations in brackets.
- ASK only ONE question at a time.
- If user is vague, make a smart assumption.
- Once intent is clear, stop digging and start helping.
- BE CONVERSATIONAL AND DIRECT.`;

    // Constructing the full message payload including history (Memory Update)
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map(msg => ({ 
        role: msg.role === 'bot' ? 'assistant' : 'user', 
        content: msg.text 
      })),
      { role: "user", content: prompt }
    ];

    const modelsToTry = [
      "google/gemini-flash-1.5",
      "meta-llama/llama-3.1-8b-instruct",
      "mistralai/mistral-7b-instruct"
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
            "X-Title": "Risel AI Agent"
          },
          body: JSON.stringify({
            model: model,
            messages: messages
          })
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          return res.status(200).json({ reply: data.choices[0].message.content });
        } else {
          lastError = data.error?.message || "Unknown error";
          continue;
        }
      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    return res.status(200).json({ reply: "⚠️ AI is busy. Please try again." });

  } catch (error) {
    return res.status(200).json({ reply: "CRASH: " + error.message });
  }
}
