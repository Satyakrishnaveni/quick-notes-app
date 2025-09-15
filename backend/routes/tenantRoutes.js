const express = require("express");
const router = express.Router();
const Tenant = require("../models/Tenant");
const authMiddleware = require("../middleware/authMiddleware");
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, plan } = req.body;
    if (!name) return res.status(400).json({ message: "Tenant name is required" });

    const tenant = await Tenant.create({
      name,
      plan: plan || "free", 
    });

    res.status(201).json(tenant);
  } catch (err) {
    console.error("Tenant creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.json(tenants);
  } catch (err) {
    console.error("Get tenants error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/:id/plan", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    tenant.plan = req.body.plan || tenant.plan;
    await tenant.save();

    res.json(tenant);
  } catch (err) {
    console.error("Update tenant error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
