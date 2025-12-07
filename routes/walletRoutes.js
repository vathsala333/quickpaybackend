const express = require("express");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Wallet balance and money operations
 */

/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get user wallet balance
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   example: 1200
 *       404:
 *         description: User not found
 */

// ⭐ Get wallet balance
router.get("/balance", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ balance: user.wallet });
});

/**
 * @swagger
 * /wallet/add:
 *   post:
 *     summary: Add money to wallet
 *     tags: [Wallet]
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
 *                 example: 500
 *     responses:
 *       200:
 *         description: Money added successfully
 *       400:
 *         description: Invalid amount
 */
// ⭐ Add money
router.post("/add", verifyToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Invalid amount" });

  const user = await User.findById(req.user.userId);
  user.wallet += amount;
  await user.save();

  res.json({ message: "Money added", balance: user.wallet });
});

// ⭐ Deduct money
router.post("/deduct", verifyToken, async (req, res) => {
  const { amount } = req.body;

  const user = await User.findById(req.user.userId);

  if (user.wallet < amount)
    return res.status(400).json({ message: "Insufficient balance" });

  user.wallet -= amount;
  await user.save();

  res.json({ message: "Money deducted", balance: user.wallet });
});

module.exports = router;
