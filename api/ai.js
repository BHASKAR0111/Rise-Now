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

    // 🏗️ ARCHITECTURE: Educator & Mentor Focused Agent
    const systemPrompt = `You are Risel, an AI Career Mentor & Educational Coach. 
Your goal is not just to chat, but to TEACH and BUILD SKILLS.

MONETIZATION HOOK:
- Always try to transition from general advice to a "4-Week Structured Skill Sprint".
- Mention that as a Pro Mentor, you can provide day-by-day tasks, curated resources, and placement-ready projects.

RULES:
- NO EMOJIS.
- MIRROR user language (English/Hindi/Hinglish).
- Be a "Smart Friend" who pushes the user to learn.
- Once the user shows interest in a skill, offer to build a "Full 4-Week Sprint".
- Limit responses to actionable steps.

FLOW:
1. Greet + Identify Skill Gap.
2. Provide a 1-week "Trial" roadmap for free.
3. Encourage upgrading to get the "Full 4-Week Placement-Ready Sprint".`;

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

    for (const model of modelsToTry) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://risel-ai.vercel.app",
            "X-Title": "Risel AI Mentor"
          },
          body: JSON.stringify({ model, messages })
        });

        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          return res.status(200).json({ reply: data.choices[0].message.content });
        }
      } catch (err) { continue; }
    }

    return res.status(200).json({ reply: "⚠️ AI-Mentor is busy. Try again." });

  } catch (error) {
    return res.status(200).json({ reply: "CRASH: " + error.message });
  }
}
