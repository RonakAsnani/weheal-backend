const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./userModel");

const stressSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId },
    phyStress: { type: Number, required: true },
    inteStress: { type: Number, required: true },
    socialStress: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Stress = mongoose.model("Stress", stressSchema);

module.exports = Stress;
