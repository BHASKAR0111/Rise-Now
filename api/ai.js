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

TONE: Warm, direct, like a smart friend. Not robotic.

CONVERSATION RULES:
- Never ask more than one question at a time
- If user gives a vague answer, make a reasonable assumption and move forward
- Never say "I couldn't understand that" — always try to interpret what they mean
- Once you understand the problem, stop asking and start helping
- Give short, clear, actionable advice

CONVERSATION FLOW:
1. Short greeting + one question
2. One follow-up question max to clarify
3. Then give concrete help — don't keep digging

FIRST MESSAGE: One line only. Casual and short.

EXAMPLE:
User: I can't land a job
You: Got it. Are you not getting interview calls, or getting rejected after interviews?
User: No calls at all
You: That's usually a resume or application issue. What field are you applying in?

Always be honest. Never give vague advice.`;

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
            "X-Title": "Risel AI"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt }
            ]
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

    return res.status(200).json({ reply: "⚠️ AI is busy. Please try again in a moment." });

  } catch (error) {
    return res.status(200).json({ reply: "CRASH: " + error.message });
  }
}
