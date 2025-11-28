// backend/routes/sarvam-tts.js
const express = require("express");
const { SarvamAIClient } = require("sarvamai"); // Official Sarvam SDK
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text = "", target_language_code = "en-IN", speaker = "anushka" } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ ok: false, error: "Missing 'text' in request body" });
    }

    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    if (!SARVAM_API_KEY) {
      console.error("Missing SARVAM_API_KEY");
      return res.status(500).json({ ok: false, error: "Server misconfiguration: Missing API key" });
    }

    // initialize client
    const client = new SarvamAIClient({ apiSubscriptionKey: SARVAM_API_KEY });

    // Bound text length to avoid huge requests
    const safeText = String(text).slice(0, 1500);

    // call SDK
    const response = await client.textToSpeech.convert({
      text: safeText,
      model: "bulbul:v2",
      speaker,
      target_language_code,
    });

    // extract base64 audio
    let audioBase64 = "";
    if (response.audio) audioBase64 = response.audio;
    else if (Array.isArray(response.audios) && response.audios.length > 0) audioBase64 = response.audios[0];
    else {
      console.error("No audio returned from Sarvam:", response);
      return res.status(502).json({ ok: false, error: "No audio data returned by Sarvam" });
    }

    const audioBuffer = Buffer.from(audioBase64, "base64");

    // headers for browser playback
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Length", audioBuffer.length);

    // stream/send buffer
    return res.status(200).send(audioBuffer);
  } catch (err) {
    console.error("Sarvam TTS Error:", err);
    // If Sarvam SDK returns richer error info you can include it conditionally
    return res.status(500).json({ ok: false, error: "Sarvam TTS failed", details: err?.message || String(err) });
  }
});

module.exports = router;
