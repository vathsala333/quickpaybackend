const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ------------------ JWT Generator ------------------
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication APIs
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vathsala
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: test123
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Email already registered
 */
// ------------------ SIGNUP ------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      balance: 1000,
    });

    const token = generateToken(newUser);

    res.json({
      user: { id: newUser._id, name: newUser.name, email: newUser.email, balance: newUser.balance },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup error" });
  }
});
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: test123
 *     responses:
 *       200:
 *         description: Login success with JWT token
 *       400:
 *         description: Invalid login credentials
 */
// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid login" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid login" });

    const token = generateToken(user);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, balance: user.balance },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
});
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       404:
 *         description: User not found
 */
// ------------------ FORGOT PASSWORD USING BREVO ------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found with this email" });

    // Generate token valid for 10 min
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // Store in DB
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Reset link
    const resetLink = `https://quickpay-frontend.netlify.app/reset/${resetToken}`;

    // Send Email via Brevo
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "QuickPay Support", email: process.env.EMAIL_USER },
        to: [{ email: user.email }],
        subject: "Reset Your QuickPay Password",
        htmlContent: `
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click below:</p>
          <a href="${resetLink}" 
            style="background:#4CAF50;padding:10px 15px;color:white;text-decoration:none;border-radius:5px;">
            Reset Password
          </a>
          <p>This link expires in <b>10 minutes</b>.</p>
          <br/>
          <small>If this wasn't you, ignore this email.</small>
        `
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo Error:", errorData);
      return res.status(500).json({ message: "Email sending failed" });
    }

    res.json({ message: "Reset link sent to your email!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending reset email" });
  }
});
/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset user password using token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT reset token sent by email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */


// ========== 2️⃣ RESET PASSWORD ==========
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token expired or user not found" });

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now login." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = router;







/*const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// ⭐ JWT generator
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || "verySecretKeyHere",
    { expiresIn: "1h" }
  );
};

// ⭐ Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      balance: 1000, // ⭐ default starting balance
    });

    const token = generateToken(newUser);

    res.json({
      user: { id: newUser._id, name: newUser.name, email: newUser.email, balance: newUser.balance },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup error" });
  }
});

// ⭐ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid login" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid login" });

    const token = generateToken(user);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, balance: user.balance },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

// ⭐ Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Create reset token valid for 10 minutes
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "verySecretKeyHere",
      { expiresIn: "10m" }
    );

    // Save reset token into DB
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    // ⭐ Brevo SMTP Transport
   const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});


    const resetLink = `http://localhost:5173/reset/${resetToken}`;

    await transporter.sendMail({
      from: `"QuickPay Support" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the button below to reset your password. This link expires in <b>10 minutes</b>.</p>
        <a href="${resetLink}" 
        style="background:#4A90E2;padding:10px 20px;color:white;text-decoration:none;border-radius:6px;">
        Reset Password</a>
        <br><br>
        <small>If you didn't request this, just ignore this email.</small>
      `
    });

    res.json({ message: "Password reset link sent!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending email" });
  }
});

// ⭐ Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Token valid?
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset error" });
  }
});

module.exports = router;*/

