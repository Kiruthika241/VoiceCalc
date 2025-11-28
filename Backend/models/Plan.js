// backend/models/Plan.js
const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true, // store like "₹149" or "₹149 - month"
    },
    duration: {
      type: String,
      required: true, // e.g. "30 Days", "6 months", "year"
    },
    features: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
