// backend/routes/planRoutes.js
const express = require("express");
const {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} = require("../controllers/planController");

const router = express.Router();

// GET /api/plans    -> get all
router.get("/", getPlans);

// GET /api/plans/:id -> get one
router.get("/:id", getPlanById);

// POST /api/plans    -> create
router.post("/", createPlan);

// PUT /api/plans/:id -> update
router.put("/:id", updatePlan);

// DELETE /api/plans/:id -> delete
router.delete("/:id", deletePlan);

module.exports = router;
