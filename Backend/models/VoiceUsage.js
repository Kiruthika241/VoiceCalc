// models/VoiceUsage.js
const mongoose = require("mongoose");

const VoiceUsageSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null, index: true },
    lang: { type: String, default: null },
    rawText: { type: String, default: null },
    parsed: { type: String, default: null },
    meta: { type: Object, default: {} }, // optional extra data (ua, ip, etc)
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("VoiceUsage", VoiceUsageSchema);
