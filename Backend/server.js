// Backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const sarvamTTSRoute = require("./routes/sarvam-tts"); // ✅ Sarvam route

const planRoutes = require("./routes/planRoutes");
const offerRoutes = require("./routes/offerRoutes");

const analyticsRoutes = require("./routes/analytics");

const app = express();

/* =========================
   1) Connect MongoDB
   ========================= */
connectDB();

/* =========================
   2) Core Middlewares
   ========================= */

// CORS for Vite frontend
app.use(
  cors({
    origin: `${process.env.REACT_APP_BACKEND_URL}`, // Vite default port; change if needed
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Parse JSON bodies
app.use(express.json());

/* =========================
   3) Basic Routes
   ========================= */

// Test route
app.get("/", (req, res) => {
  res.send("EzyVoiceCalc API running ✅");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend healthy ✅" });
});

// Auth + users routes (users list also here)
app.use("/api/auth", authRoutes);

// Sarvam TTS route (🔊 main one)
app.use("/api/sarvam-tts", sarvamTTSRoute);

/* =========================
   4) (Optional) Static frontend – if later you build & serve from backend
   ========================= */

// const frontendDist = path.join(__dirname, "../Frontend/EzyVoiceCalculator/dist");
// app.use(express.static(frontendDist));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(frontendDist, "index.html"));
// });



app.use("/api/plans", planRoutes);
app.use("/api/offers", offerRoutes);

app.use("/api/analytics", analyticsRoutes);


/* =========================
   5) Start server
   ========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
