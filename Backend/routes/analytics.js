// routes/analytics.js
const express = require("express");
const router = express.Router();
const analytics = require("../controllers/analyticsController");

// optional: if you have auth middleware, require it here
// const { requireAuth } = require("../middleware/auth");

// Record new voice input (public or protected depending on your platform)
router.post("/voice-input", /* requireAuth, */ analytics.recordVoiceInput);

// Today's voice count (or since=ISO-date)
router.get("/voice-count", /* requireAuth, */ analytics.getVoiceCount);

// List recent voice events (admin)
router.get("/voice-logs", /* requireAuth, */ analytics.getVoiceLogs);

module.exports = router;
