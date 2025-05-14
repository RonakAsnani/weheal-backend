const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./userModel");

const chatRoomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId }],
    isGroup: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

module.exports = ChatRoom;
