// Backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const sarvamTTSRoute = require("./routes/sarvam-tts");
const planRoutes = require("./routes/planRoutes");
const offerRoutes = require("./routes/offerRoutes");
const analyticsRoutes = require("./routes/analytics");

const app = express();

/* =========================
   1) Connect MongoDB
   ========================= */
connectDB();

/* =========================
   2) CORS Configuration
   ========================= */

const allowedOrigins = [
  "http://localhost:5173",                  // Local development
  process.env.FRONTEND_URL                 // Your Render frontend URL
].filter(Boolean); // Removes undefined values

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow no-origin requests (Postman, Curl, SSR)
  if (!origin) return next();

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
  } else {
    console.log("❌ CORS blocked origin:", origin);
    return res.status(403).json({
      error: "CORS policy: This origin is not allowed!",
      origin,
    });
  }

  next();
});

/* =========================
   3) Parse JSON Request Bodies
   ========================= */
app.use(express.json());

/* =========================
   4) Basic Routes
   ========================= */

// Test route
app.get("/", (req, res) => {
  res.send("EzyVoiceCalc API running ✅");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend healthy ✅" });
});

/* =========================
   5) API Routes
   ========================= */

app.use("/api/auth", authRoutes);
app.use("/api/sarvam-tts", sarvamTTSRoute);
app.use("/api/plans", planRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/analytics", analyticsRoutes);

/* =========================
   6) Start Server
   ========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
