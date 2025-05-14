const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const expertDetailSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    number: {
      type: String,
    },
    experience: {
      type: Number,
    },
    details: {
      type: String,
    },
    image: {
      type: String,
    },
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const ExpertDetails = mongoose.model("ExpertDetails", expertDetailSchema);

module.exports = ExpertDetails;
