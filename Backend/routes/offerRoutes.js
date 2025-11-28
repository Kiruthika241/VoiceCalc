const express = require("express");
const router = express.Router();
const {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  applyOffer,
} = require("../controllers/offerController");

// CRUD
router.post("/", createOffer);
router.get("/", getOffers);
router.get("/:id", getOfferById);
router.put("/:id", updateOffer);
router.delete("/:id", deleteOffer);

// Apply offer code (for Payment Page)
router.post("/apply", applyOffer);

module.exports = router;
