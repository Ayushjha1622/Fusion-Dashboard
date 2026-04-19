const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const intelligenceRoutes = require("./routes/intelligence.routes");
const authRoutes = require("./routes/auth.routes");
const osintRoutes = require("./routes/osint.routes");
const authMiddleware = require("./middlewares/auth.middleware");

const app = express();

// 1. Core Parsers (Must be first)
app.use(express.json());
app.use(cookieParser());

// 2. Advanced CORS
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Manual header fallback for some proxies
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    cookies: req.cookies
  });
  next();
});

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
