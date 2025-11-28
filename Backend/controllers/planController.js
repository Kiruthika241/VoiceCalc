// backend/controllers/planController.js
const Plan = require("../models/Plan");

/* ================================
   CREATE PLAN
================================ */
const createPlan = async (req, res) => {
  try {
    const { name, price, duration, features, status } = req.body;

    const plan = await Plan.create({
      name,
      price,
      duration,
      features,
      status,
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ message: "Failed to create plan" });
  }
};

/* ================================
   GET ALL PLANS
================================ */
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 }); // newest first
    res.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
};

/* ================================
   GET SINGLE PLAN
================================ */
const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ message: "Failed to fetch plan" });
  }
};

/* ================================
   UPDATE PLAN
================================ */
const updatePlan = async (req, res) => {
  try {
    const { name, price, duration, features, status } = req.body;

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { name, price, duration, features, status },
      { new: true }
    );

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.json(plan);
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ message: "Failed to update plan" });
  }
};

/* ================================
   DELETE PLAN
================================ */
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({ message: "Failed to delete plan" });
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};
