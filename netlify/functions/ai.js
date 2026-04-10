exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt, model } = JSON.parse(event.body);
    const API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = model || "gemini-1.5-flash-latest";

    if (!API_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "API Key not configured in environment variables." }) 
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || "Gemini API failed" })
      };
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error("AI Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
