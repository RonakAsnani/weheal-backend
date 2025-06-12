const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./userModel");

const walletSchema = mongoose.Schema(
  {
    balance: {
      type: Number,
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId },
    transactions: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        // momentBalance: { type: Number, required: true },
        added: { type: Boolean, required: true }, // true if money added, false if deducted
        createdAt: { type: Date, default: Date.now }, // optional, but useful
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
