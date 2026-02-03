const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./userModel");

const moodSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId },
    mood: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Mood = mongoose.model("Mood", moodSchema);

module.exports = Mood;
