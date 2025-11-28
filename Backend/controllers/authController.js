// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT Token
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* =====================================================
   SIGNUP
===================================================== */
const signup = async (req, res) => {
  try {
    const { name, phone, email, password, location } = req.body;

    if (!name || !phone || !email || !password || !location) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const normalizedEmail = email.toLowerCase();

    // Check duplicates
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      email: normalizedEmail,
      password: hashedPassword,
      location,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        location: user.location,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
};

/* =====================================================
   LOGIN
===================================================== */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password are required." });
    }

    const normalizedIdentifier =
      identifier.includes("@") ? identifier.toLowerCase() : identifier;

    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { phone: normalizedIdentifier }],
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        location: user.location,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

/* =====================================================
   GET LOGGED-IN USER
   (protected route - requires protect middleware)
===================================================== */
const getMe = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* =====================================================
   GET ALL USERS (Public / Admin)
   returns array without password
===================================================== */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};

/* =====================================================
   GET USER COUNT (lightweight)
   returns { count: Number }
===================================================== */
const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("getUserCount error:", err);
    res.status(500).json({ message: "Server error while fetching user count." });
  }
};

/* =====================================================
   UPDATE USER
   Note: current routes expose this as public — consider protecting it
===================================================== */
const updateUser = async (req, res) => {
  try {
    const { name, phone, email, location, role } = req.body;

    // normalize email if provided
    const update = {};
    if (name) update.name = name;
    if (phone) update.phone = phone;
    if (email) update.email = email.toLowerCase();
    if (location) update.location = location;
    if (role) update.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found." });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: "Server error while updating user." });
  }
};

/* =====================================================
   DELETE USER
===================================================== */
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "User not found." });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Server error while deleting user." });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  getAllUsers,
  getUserCount,
  updateUser,
  deleteUser,
};
