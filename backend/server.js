require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/db");

// Connect DB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const tenantRoutes = require("./routes/tenantRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tenants", tenantRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
