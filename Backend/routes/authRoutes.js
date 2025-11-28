// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getMe,
  getAllUsers,
  getUserCount,
  updateUser,
  deleteUser,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected: get logged-in user
router.get("/me", protect, getMe);

// Public: lightweight count endpoint
router.get("/users/count", getUserCount);

// Public: get all users (list)
router.get("/users", getAllUsers);

// Update & Delete: currently public (consider protect + adminOnly)
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
