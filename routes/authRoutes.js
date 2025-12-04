
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

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
    res.status(500).json({ message: "Login error" });
  }
});

// ------------------ FORGOT PASSWORD ------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Nodemailer SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.BREVO_SMTP_PASSWORD,
      },
    });

    // 🟢 Production frontend URL
    const resetLink = `https://quickpay-frontend.netlify.app/reset/${resetToken}`;

    await transporter.sendMail({
      from: `"QuickPay Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your QuickPay Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password. Link expires in <b>10 minutes</b>.</p>
        <a href="${resetLink}" style="background:#4caf50;padding:10px 15px;color:white;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <br><br>
        <small>If you did not request this, ignore this email.</small>
      `
    });

    res.json({ message: "Reset link sent to your email!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

// ------------------ RESET PASSWORD ------------------
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset failed" });
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

