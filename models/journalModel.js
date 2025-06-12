const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./userModel");

const journalSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId },
    journal: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }, // optional, but useful
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Journal = mongoose.model("Journal", journalSchema);

module.exports = Journal;
