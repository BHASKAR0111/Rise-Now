/**
 * voice.js - Premium AI Voice Integration for Risel
 * Supports ElevenLabs (Neural AI) for realistic voices
 * Fallback to Web Speech API if API key is missing
 */

(function() {
  let recognition;
  let isListening = false;
  let silenceTimer;
  const SILENCE_DURATION = 3000; // 3 seconds
  let audioPlayer = new Audio(); // For TwelveLabs/External AI audio

  // 🎙️ SPEECH RECOGNITION SETUP
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const textarea = document.getElementById('fc-user-answer');
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interimTranscript += event.results[i][0].transcript;
      }

      if (finalTranscript) {
        textarea.value += (textarea.value ? ' ' : '') + finalTranscript;
        resetSilenceTimer();
      }
    };

    recognition.onstart = () => { isListening = true; updateMicUI(true); resetSilenceTimer(); };
    recognition.onend = () => { isListening = false; updateMicUI(false); clearTimeout(silenceTimer); };
    recognition.onerror = () => { stopListening(); };
  }

  function startListening() { if (recognition && !isListening) recognition.start(); }
  function stopListening() { if (recognition && isListening) recognition.stop(); }

  function resetSilenceTimer() {
    clearTimeout(silenceTimer);
    if (isListening) {
      const toggle = document.getElementById('voiceModeToggle');
      if (toggle && toggle.checked) {
        silenceTimer = setTimeout(() => {
          stopListening();
          if (window.submitToAI) window.submitToAI();
        }, SILENCE_DURATION);
      }
    }
  }

  // 🔊 PREMIUM VOICE PLAYER (ELVENLABS)
  async function speak(text) {
    const config = window.GEMINI_CONFIG || {};
    const EL_KEY = config.ELEVENLABS_API_KEY || "";
    const VOICE_ID = config.ELEVENLABS_VOICE_ID || "21m00Tcm4lP9RIvstS0f";

    // Clean text: strip HTML and extra spaces
    const plainText = text.replace(/<[^>]*>?/gm, '').trim();
    if (!plainText) return;

    // TRY ELEVENLABS (High-Fidelity AI)
    if (EL_KEY && EL_KEY.length > 10) {
      console.log("Risel is calling ElevenLabs for premium audio...");
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
          method: "POST",
          headers: {
            "xi-api-key": EL_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: plainText,
            model_id: "eleven_multilingual_v2", // Better for Hinglish/Global
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          audioPlayer.src = url;
          audioPlayer.play();
          return; // Exit if playback starts
        } else {
          console.warn("ElevenLabs failed, using fallback...");
        }
      } catch (e) { console.error("ElevenLabs Error:", e); }
    }

    // 🏆 FALLBACK: Enhanced Browser Voice
    console.log("Using Browser Fallback Voice...");
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(plainText);
      const voices = window.speechSynthesis.getVoices();
      
      const preferred = 
        voices.find(v => v.name.includes('Natural') && v.lang.includes('en')) || 
        voices.find(v => v.name === 'Google US English') || 
        voices.find(v => v.name.includes('Neural') && v.lang.includes('en')) ||
        voices.find(v => v.lang.includes('en-IN')) || voices[0];
      
      if (preferred) {
        utterance.voice = preferred;
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
      }
      window.speechSynthesis.speak(utterance);
    }
  }

  function updateMicUI(active) {
    const micBtn = document.getElementById('micBtn');
    if (!micBtn) return;
    if (active) {
      micBtn.style.background = 'rgba(255, 71, 87, 0.4)';
      micBtn.classList.add('pulsing');
    } else {
      micBtn.style.background = 'rgba(0, 194, 255, 0.2)';
      micBtn.classList.remove('pulsing');
    }
  }

  // EVENT LISTENERS
  document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('micBtn');
    const toggle = document.getElementById('voiceModeToggle');
    if (micBtn) micBtn.addEventListener('click', () => isListening ? stopListening() : startListening());
    if (toggle) toggle.addEventListener('change', () => { 
        if (!toggle.checked) { stopListening(); window.speechSynthesis.cancel(); audioPlayer.pause(); } 
    });
  });

  window.speak = speak;
  window.startListening = startListening;
  window.stopListening = stopListening;
})();
