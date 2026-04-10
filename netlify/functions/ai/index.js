exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "DEBUG: API Key is missing in Netlify Env Vars." }) 
      };
    }

    // ⭐ STEP 1: AUTO-DETECT MODELS AVAILABLE FOR THIS KEY
    console.log("Auto-detecting available models...");
    const modelListUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const listResponse = await fetch(modelListUrl);
    const listData = await listResponse.json();

    if (!listResponse.ok) {
      return {
        statusCode: listResponse.status,
        body: JSON.stringify({ error: `Could not list models: ${listData.error?.message}` })
      };
    }

    // Find the best available flash model
    const availableModels = listData.models || [];
    const bestModel = availableModels.find(m => m.name.includes('gemini-1.5-flash')) || 
                        availableModels.find(m => m.name.includes('gemini-1.5-pro')) ||
                        availableModels.find(m => m.name.includes('gemini-pro')) ||
                        availableModels[0];

    if (!bestModel) {
      return { statusCode: 500, body: JSON.stringify({ error: "No models available for this API Key." }) };
    }

    const selectedModelName = bestModel.name; // This will be like "models/gemini-1.5-flash"
    console.log("Selected Model:", selectedModelName);

    // ⭐ STEP 2: CALL THE DETECTED MODEL
    const url = `https://generativelanguage.googleapis.com/v1beta/${selectedModelName}:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `Google rejected ${selectedModelName}. Reason: ${data.error?.message}` 
        })
      };
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply, model_used: selectedModelName })
    };

  } catch (error) {
    console.error("AI Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "DEBUG: " + error.message })
    };
  }
};
