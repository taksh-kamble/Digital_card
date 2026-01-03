import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load env
dotenv.config();

// Routes
import userRoutes from "./routes/userRoute.js";
import subscriptionRoutes from "./routes/subscribtionRoute.js";
import cardRoutes from "./routes/cardRoute.js";
import recentlyScannedRoutes from "./routes/recentlyScannedRoutes.js";

// Initialize app
const app = express();
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    express.json()(req, res, next);
  } else {
    next();
  }
});
// ----------------------
// MIDDLEWARE
// ----------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.urlencoded({ extended: true }));

// ----------------------
// HEALTH CHECK
// ----------------------
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Digital Card API running 🚀",
  });
});

// ----------------------
// API ROUTES
// ----------------------
app.use("/api/users", userRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/recently-scanned", recentlyScannedRoutes);

// ----------------------
// 404 HANDLER
// ----------------------
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ----------------------
// GLOBAL ERROR HANDLER
// ----------------------
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
