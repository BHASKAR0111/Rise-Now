export default async function handler(req, res) {
  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://risenow.vercel.app", // optional but recommended
        "X-Title": "RiseNow AI"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "You are RiseNow AI, a helpful career coach." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    console.log("OpenRouter response:", data);

    if (!data.choices) {
      return res.status(500).json({
        error: "AI error",
        details: data
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server error"
    });
  }
}
