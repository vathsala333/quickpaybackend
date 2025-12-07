const express = require("express");
const Razorpay = require("razorpay");
const Transaction = require("../models/Transaction");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Handles Razorpay transactions and history
 */

/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     summary: Create a Razorpay order
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 10
 *               customerName:
 *                 type: string
 *                 example: "Varsha"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: varsha@mail.com
 *     responses:
 *       200:
 *         description: Order created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
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

/**
 * @swagger
 * /api/payment/update-status:
 *   post:
 *     summary: Update payment status after Razorpay confirmation
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "order_LGDFvU72dhg"
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, FAILED]
 *                 example: "COMPLETED"
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Transaction not found
 */
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

/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     summary: Get logged-in user's payment history
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the transaction history
 *       401:
 *         description: Unauthorized
 */
router.get("/history", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  const list = await Transaction.find({ userId }).sort({ createdAt: -1 });

  res.json(list);
});

module.exports = router;
