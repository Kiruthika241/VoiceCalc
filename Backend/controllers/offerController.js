const Offer = require("../models/Offer");

/* =========================
   CREATE OFFER
========================= */
const createOffer = async (req, res) => {
  try {
    let { title, description, code, price, discount, duration, status } = req.body;

    if (!title || !code || price == null || discount == null || duration == null) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    code = String(code).trim().toUpperCase();

    const offer = await Offer.create({
      title,
      description,
      code,
      price: Number(price),
      discount: Number(discount),
      duration: Number(duration),
      status: status || "Active",
    });

    res.status(201).json(offer);
  } catch (err) {
    console.error("Error creating offer:", err);
    res.status(500).json({ message: "Error creating offer", error: err.message });
  }
};

/* =========================
   GET ALL OFFERS
========================= */
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({ message: "Error fetching offers" });
  }
};

/* =========================
   GET ONE OFFER
========================= */
const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json(offer);
  } catch (err) {
    console.error("Error fetching offer:", err);
    res.status(500).json({ message: "Error fetching offer" });
  }
};

/* =========================
   UPDATE OFFER
========================= */
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, code, price, discount, duration, status } = req.body;

    if (code) code = String(code).trim().toUpperCase();

    const updated = await Offer.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(code && { code }),
        ...(price !== undefined && { price: Number(price) }),
        ...(discount !== undefined && { discount: Number(discount) }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(status && { status }),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Offer not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error updating offer:", err);
    res.status(500).json({ message: "Error updating offer" });
  }
};

/* =========================
   DELETE OFFER
========================= */
const deleteOffer = async (req, res) => {
  try {
    const deleted = await Offer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer deleted" });
  } catch (err) {
    console.error("Error deleting offer:", err);
    res.status(500).json({ message: "Error deleting offer" });
  }
};

/* =========================
   APPLY OFFER CODE
   Body: { code, amount }
========================= */
const applyOffer = async (req, res) => {
  try {
    let { code, amount } = req.body;

    if (!code || amount == null) {
      return res
        .status(400)
        .json({ success: false, message: "Code and amount are required" });
    }

    const baseAmount = Number(amount);
    if (isNaN(baseAmount) || baseAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid base amount" });
    }

    const cleanCode = String(code).trim().toUpperCase();

    const offer = await Offer.findOne({ code: cleanCode, status: "Active" });
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive offer code.",
      });
    }

    const discountPercent = Number(offer.discount) || 0;
    const discountAmount = Math.round((baseAmount * discountPercent) / 100);
    const newAmount = Math.max(0, baseAmount - discountAmount);

    return res.json({
      success: true,
      newAmount,
      discountPercent,
      discountAmount,
      message: `${discountPercent}% discount applied! You save ₹${discountAmount}.`,
      offerId: offer._id,
    });
  } catch (err) {
    console.error("Error applying offer:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while applying offer.",
    });
  }
};

module.exports = {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  applyOffer,
};
