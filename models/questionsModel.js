const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./userModel");

const questionsSchema = mongoose.Schema(
  {
    questions: [
      {
        question: { type: String, required: true },
        hint: { type: String, required: true },
        type: { type: String, required: true },
        options: {
          id: { type: String, required: true },
          text: { type: String, required: true },
          emoji: { type: String },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model("Question", questionsSchema);

module.exports = Question;
