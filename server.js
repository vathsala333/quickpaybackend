require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");

const app = express();

// ⭐ Middlewares first
app.use(cors());
app.use(express.json());

// ⭐ Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wallet", walletRoutes);

// ⭐ Base route
app.get("/", (req, res) => {
  res.send("🚀 QuickPay API Running");
});

// ⭐ MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(5000, () =>
      console.log("🚀 Server running at http://localhost:5000")
    );
  })
  .catch((err) => console.error("❌ DB Error:", err));
