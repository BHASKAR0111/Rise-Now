// config.js – central configuration for Rise-Now
window.GEMINI_CONFIG = {
  // Use Netlify Proxy for production security
  USE_PROXY: true, 
  PROXY_URL: "/.netlify/functions/ai",
  
  // Local/Dev fallback (Manual Key - DO NOT LEAK)
  GEMINI_API_KEY: "", 
  GEMINI_MODEL: "gemini-1.5-flash-latest",
  
  // PREMIUM VOICE: User Selection (Jessica)
  ELEVENLABS_API_KEY: "", 
  ELEVENLABS_VOICE_ID: "56AoDkrOh6qfVPDXZ7Pt" 
};
