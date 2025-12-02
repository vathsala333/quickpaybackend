const express = require("express");
const Razorpay = require("razorpay");
const Transaction = require("../models/Transaction");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
router.post("/create-order", verifyToken, async (req, res) => {
  const { amount, customerName, mobile, email } = req.body;
  const userId = req.user.userId;

  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    await Transaction.create({
      userId,
      customerName,
      mobile,
      email,
      amount,
      orderId: order.id,
      status: "PENDING",
    });

    console.log("Order Created:", order);

    res.json({ order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

// Update payment status
router.post("/update-status", verifyToken, async (req, res) => {
  const { orderId, status } = req.body;

  console.log("Update Request:", req.body);

  const tx = await Transaction.findOneAndUpdate(
    { orderId },
    { status },
    { new: true }
  );

  res.json({ message: "Updated", tx });
});

// Fetch user payment history
router.get("/history", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  const list = await Transaction.find({ userId }).sort({ createdAt: -1 });

  res.json(list);
});

module.exports = router;


























/*const express = require("express");
const Razorpay = require("razorpay");
const Transaction = require("../models/Transaction");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ⭐ Create Order
router.post("/create-order", verifyToken, async (req, res) => {
  const { amount, customerName, mobile, email } = req.body;
  const userId = req.user.userId;

  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    await Transaction.create({
      userId,
      customerName,
      mobile,
      email,
      amount,
      orderId: order.id,
      status: "PENDING",
    });
console.log("Order Created:", order);

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Order creation failed" });
  }
});

// ⭐ Update payment status
router.post("/update-status", verifyToken, async (req, res) => {
  const { orderId, status } = req.body;

  const tx = await Transaction.findOneAndUpdate(
    { orderId },
    { status },
    { new: true }
  );
console.log("Update Request:", req.body);

  res.json({ message: "Updated", tx });
});

// ⭐ Fetch user payment history
router.get("/history/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  const list = await Transaction.find({ userId }).sort({ createdAt: -1 });

  res.json(list);
});

module.exports = router;*/
