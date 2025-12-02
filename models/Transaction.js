const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: String,
    customerName: String,
    mobile: String,
    email: String,
    amount: Number,
    orderId: String,
    status: {
      type: String,
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
