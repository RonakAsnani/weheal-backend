const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
    },
    text: {
      type: String,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      default: null,
    },

    mentionedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", messageSchema);

module.exports = Messages;
