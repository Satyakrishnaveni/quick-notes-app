const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email }).populate("tenant");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      role: user.role,
      tenant: user.tenant?.name || null,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
