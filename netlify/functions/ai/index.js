exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const API_KEY = process.env.OPENROUTER_API_KEY;

    if (!API_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "DEBUG: OPENROUTER_API_KEY is missing in Netlify Env Vars." }) 
      };
    }

    console.log("Calling OpenRouter Bridge...");
    const url = "https://openrouter.ai/api/v1/chat/completions";
    
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://risel-ai.netlify.app", // Optional
        "X-Title": "Risel AI" // Optional
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Raw Error:", JSON.stringify(data));
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `OpenRouter rejected the request. Reason: ${data.error?.message || "Unknown"}` 
        })
      };
    }

    const reply = data.choices?.[0]?.message?.content || "No response received.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error("AI Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "DEBUG: Server Crash - " + error.message })
    };
  }
};
