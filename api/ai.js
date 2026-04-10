export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    const API_KEY = process.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      return res.status(200).json({ reply: "ERROR: OPENROUTER_API_KEY MISSING." });
    }

    const systemPrompt = `You are Risel, an AI Career Coach. You help users with career paths, roadmaps, interview prep, and jobs.

LANGUAGE RULE: Mirror the user's language exactly.
- English → reply in English
- Hindi → reply in Hindi  
- Hinglish → reply in Hinglish
Never mix languages unnaturally. No translations in brackets.

TONE: Professional but warm. Direct. Conversational.

FORMATTING:
- Keep responses short and clean
- No emojis
- No long paragraphs
- Ask one question at a time

CONVERSATION FLOW:
1. Greet shortly, ask what they need help with
2. Ask follow-up questions to understand their situation
3. Only then give advice or solutions

FIRST MESSAGE: One short line greeting + one simple question. Nothing more.

Always be honest. Never give vague advice.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://risel-ai.vercel.app",
        "X-Title": "Risel AI"
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response received.";
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(200).json({ reply: "CRASH: " + error.message });
  }
}
