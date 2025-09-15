const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const Tenant = require("../models/Tenant");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

const ensureTenant = (req, res, next) => {
  console.log("🔑 User from token:", req.user?.email, "Tenant:", req.user?.tenant);
  if (!req.user || !req.user.tenant) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.tenantId = req.user.tenant.toString();
  next();
};

const enforceNoteLimit = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) return res.status(400).json({ message: "Tenant not found" });

    if (process.env.NODE_ENV === "development") {
      console.log("⚠️ Skipping note limit check in development mode");
      return next();
    }


    if (tenant.plan === "pro") return next();


    const count = await Note.countDocuments({ tenant: req.tenantId });
    const MAX_FREE = 3;
    if (count >= MAX_FREE) {
      console.warn(`⛔ Free plan limit reached (${MAX_FREE} notes) for tenant ${tenant.name}`);
      return res
        .status(403)
        .json({ message: `Free plan limit reached (${MAX_FREE} notes). Upgrade to Pro.` });
    }

    next();
  } catch (err) {
    console.error("Error in enforceNoteLimit:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

router.post("/", authMiddleware, ensureTenant, enforceNoteLimit, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const note = await Note.create({
      title,
      content: content || "",
      tenant: req.tenantId,
      user: req.user._id,
    });

    console.log(" Note created:", note._id);
    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/", authMiddleware, ensureTenant, async (req, res) => {
  try {
    const notes = await Note.find({ tenant: req.tenantId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Fetch notes error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get("/:id", authMiddleware, ensureTenant, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    console.error("Fetch single note error:", err);
    res.status(400).json({ message: "Invalid ID or server error", error: err.message });
  }
});

router.put("/:id", authMiddleware, ensureTenant, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    const isOwner = note.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role?.toLowerCase() === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    const { title, content } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    await note.save();

    console.log("Note updated:", note._id);
    res.json(note);
  } catch (err) {
    console.error("Update note error:", err);
    res.status(400).json({ message: "Invalid ID or server error", error: err.message });
  }
});

router.delete("/:id", authMiddleware, ensureTenant, async (req, res) => {
  try {
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Note ID" });
    }

    const note = await Note.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    const isOwner = note.user?.toString() === req.user._id.toString();
    const isAdmin = req.user.role?.toLowerCase() === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: Not allowed to delete" });
    }
    await Note.deleteOne({ _id: note._id });

    return res.status(200).json({ message: "Note deleted successfully" });

  } catch (error) {
    console.error("Delete API Error:", error);
    return res.status(500).json({ message: "Internal Server Error while deleting note" });
  }
});


module.exports = router;
