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
      type: String,
    },
    message: {
      type: String,
    },
    image: {
      type: String,
    },
    qualifications: {
      type: String,
    },
    languages: [{ type: String }],
    whatIOffer: [{ type: String }],
    whenPeopleReachOut: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const ExpertDetails = mongoose.model("ExpertDetails", expertDetailSchema);

module.exports = ExpertDetails;
