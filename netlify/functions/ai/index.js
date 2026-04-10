exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = "gemini-1.5-flash";

    if (!API_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "DEBUG: API Key is missing in Netlify Env Vars." }) 
      };
    }

    // Using Header-based auth instead of URL query param
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Raw Error:", JSON.stringify(data));
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `Google rejected the request. Status: ${response.status}. Reason: ${data.error?.message || "Unknown"}. Code: ${data.error?.status || "None"}` 
        })
      };
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

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
