const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    number: {
      type: String,
    },
    profilePicCode: {
      type: Number,
      default: 0,
    },
    bgPicCode: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
    },
    socketId: {
      type: String,
    },
    assignedExpertId: {
      type: String,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    assignedExpertId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    responses: { type: Object },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

const User = mongoose.model("User", userSchema);

module.exports = User;
