// Backend/routes/sarvam-tts.js
const express = require("express");
const { SarvamAIClient } = require("sarvamai"); // ✅ Official Sarvam SDK
const router = express.Router();

/**
 * 🔊 Sarvam AI Text-to-Speech Proxy
 * ----------------------------------
 * Works for Tamil, Telugu, Kannada, Malayalam, Hindi, English, etc.
 * Uses Bulbul v2 model via SarvamAI SDK.
 *
 * Expected Request Body:
 * {
 *   "text": "மொத்த முடிவு 45",
 *   "target_language_code": "ta-IN",
 *   "speaker": "vidya"
 * }
 */

router.post("/", async (req, res) => {
  try {
    const {
      text = "",
      target_language_code = "en-IN",
      speaker = "anushka",
    } = req.body || {};

    if (!text.trim()) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing 'text' in request body" });
    }

    // ✅ Check API key
    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    if (!SARVAM_API_KEY) {
      console.error("❌ Missing SARVAM_API_KEY in .env file");
      return res
        .status(500)
        .json({ ok: false, error: "Server misconfiguration: Missing API key" });
    }

    // ✅ Initialize SDK client
    const client = new SarvamAIClient({
      apiSubscriptionKey: SARVAM_API_KEY,
    });

    // console.log(
    //   `🎙️ Generating TTS: lang=${target_language_code}, speaker=${speaker}`
    // );

    // ✅ Call SarvamAI SDK
    const response = await client.textToSpeech.convert({
      text: text.slice(0, 1500),
      model: "bulbul:v2",
      speaker,
      target_language_code,
    });

    // ✅ Check response format
    let audioBase64 = "";

    if (response.audio) {
      // older API format
      audioBase64 = response.audio;
    } else if (Array.isArray(response.audios) && response.audios.length > 0) {
      // newer format
      audioBase64 = response.audios[0];
    } else {
      console.error("❌ No valid audio found in Sarvam response:", response);
      return res
        .status(500)
        .json({ ok: false, error: "No audio data returned by Sarvam" });
    }

    // ✅ Decode Base64 → Buffer → stream MP3
    const audioBuffer = Buffer.from(audioBase64, "base64");
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);

    // console.log("✅ Audio streamed successfully for", target_language_code);
  } catch (err) {
    console.error("❌ Sarvam TTS Error:", err);
    res
      .status(500)
      .json({ ok: false, error: "Sarvam TTS failed", details: err.message });
  }
});

module.exports = router;
