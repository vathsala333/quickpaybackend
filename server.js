require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Swagger Import (only once)
const { swaggerUI, swaggerSpec } = require("./swagger");

const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");

const app = express();

// ====== 🔥 Swagger Documentation Route =========
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
console.log("📄 Swagger Docs available at /api-docs");
// ===============================================

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://quickpay-frontend.netlify.app",
];

// CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("🚫 Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wallet", walletRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Backend Running — Visit /api-docs for API documentation");
});

// Connect DB + Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("💾 MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.log("❌ DB Error:", err));
