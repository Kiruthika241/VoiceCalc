// controllers/analyticsController.js
const VoiceUsage = require("../models/VoiceUsage");

/**
 * POST /api/analytics/voice-input
 * Body: { userId, lang, rawText, parsed, meta }
 */
exports.recordVoiceInput = async (req, res) => {
  try {
    const { userId = null, lang = null, rawText = null, parsed = null, meta = {} } = req.body || {};

    // lightweight validation
    if (!rawText && !parsed) {
      return res.status(400).json({ success: false, error: "rawText or parsed is required" });
    }

    const entry = new VoiceUsage({
      userId,
      lang,
      rawText,
      parsed,
      meta,
      createdAt: new Date(),
    });

    await entry.save();
    return res.json({ success: true, id: entry._id });
  } catch (err) {
    console.error("recordVoiceInput error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/analytics/voice-count
 * Query params:
 *   - since (optional ISO date) : count from this date; default = start of today
 *   - by (optional) : "today" alias
 */
exports.getVoiceCount = async (req, res) => {
  try {
    let since;
    if (req.query.since) {
      const d = new Date(req.query.since);
      since = isNaN(d.getTime()) ? null : d;
    }
    if (!since) {
      // default to start of today server-local time
      since = new Date();
      since.setHours(0, 0, 0, 0);
    }

    const filter = { createdAt: { $gte: since } };
    if (req.query.lang) filter.lang = req.query.lang;

    const count = await VoiceUsage.countDocuments(filter);
    return res.json({ count, since: since.toISOString() });
  } catch (err) {
    console.error("getVoiceCount error:", err);
    return res.status(500).json({ count: 0, error: err.message });
  }
};

/**
 * GET /api/analytics/voice-logs
 * Query params: page, limit, lang, userId, q (search rawText/parsed)
 */
exports.getVoiceLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 200);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.lang) filter.lang = req.query.lang;
    if (req.query.userId) filter.userId = req.query.userId;

    if (req.query.q) {
      const q = req.query.q.trim();
      filter.$or = [
        { rawText: { $regex: q, $options: "i" } },
        { parsed: { $regex: q, $options: "i" } },
      ];
    }

    // optional date range
    if (req.query.since || req.query.until) {
      filter.createdAt = {};
      if (req.query.since) {
        const s = new Date(req.query.since);
        if (!isNaN(s.getTime())) filter.createdAt.$gte = s;
      }
      if (req.query.until) {
        const u = new Date(req.query.until);
        if (!isNaN(u.getTime())) filter.createdAt.$lte = u;
      }
    }

    const total = await VoiceUsage.countDocuments(filter);
    const docs = await VoiceUsage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({ total, page, limit, results: docs });
  } catch (err) {
    console.error("getVoiceLogs error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
