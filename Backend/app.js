const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const intelligenceRoutes = require("./routes/intelligence.routes");
const authRoutes = require("./routes/auth.routes");
const osintRoutes = require("./routes/osint.routes");
const authMiddleware = require("./middlewares/auth.middleware");

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    cookies: req.cookies
  });
  next();
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Auth Routes (public)
app.use("/api", authRoutes);

// Protected Routes
app.use("/api", osintRoutes);
app.use("/api", authMiddleware, intelligenceRoutes);

// Fallback 404 for /api
app.use("/api", (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

module.exports = app;
