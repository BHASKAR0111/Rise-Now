export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",  // 🔥 SAFE MODEL (always works)
        messages: [
          { role: "system", content: "You are a helpful career coach." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    console.log("DEBUG:", data);

    // 🔥 SAFE RESPONSE HANDLING
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: "No response from AI",
        full: data
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server crash"
    });
  }
}
