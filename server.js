require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");

const app = express();

// ⭐ Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",           // local frontend
  "https://quickpay-ui.netlify.app"  // deployed frontend
];

// ⭐ CORS Middleware
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (Postman, mobile apps)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// ⭐ Middleware
app.use(express.json());

// ⭐ Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wallet", walletRoutes);

// ⭐ Base route
app.get("/", (req, res) => {
  res.send("🚀 QuickPay API Running");
});

// ⭐ MongoDB Connect & Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB Connected");
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error("❌ DB Connection Error:", err));
