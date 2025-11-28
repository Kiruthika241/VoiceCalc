const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    // Code user will type in PaymentPage (ex: EZY149)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Optional: base price just for display in admin
    price: {
      type: Number,
      required: true,
    },
    // Discount percentage (ex: 50 means 50% off)
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    // Duration in days (for your UI / info)
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
