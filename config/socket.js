const { Server } = require("socket.io");
const Message = require("../models/messageModel");
const ChatRoom = require("../models/chatRoomModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const { sendNotification } = require("../utils/notificationService");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", async ({ userId, roomId }) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on(
      "sendMessage",
      async ({
        userId,
        roomId,
        text,
        replyTo,
        mentionedUsers,
        type = null,
      }) => {
        // console.log(userId, roomId, text, replyTo);
        if (type == "group") {
          let message = await Message.create({
            sender: userId,
            room: roomId,
            text,
            replyTo,
            mentionedUsers,
          });
          message = await message.populate("sender");
          io.to(roomId).emit("newMessage", message);
          return;
        }
        const user = await User.findById(userId);
        const wallet = await Wallet.findById(user.walletId);
        const balance = wallet?.balance;
        if (balance >= 25 || user.isAdmin) {
          let message = await Message.create({
            sender: userId,
            room: roomId,
            text,
            replyTo,
            mentionedUsers,
          });
          const updatedWallet = await Wallet.findByIdAndUpdate(
            user.walletId,
            {
              $inc: { balance: -25 },
              $push: {
                transactions: {
                  description: "Message sent to expert",
                  amount: 25,
                  added: false,
                  createdAt: new Date(),
                },
              },
            },
            { new: true } // returns updated document
          );
          message = await message.populate("sender");
          io.to(roomId).emit("newMessage", message);
        } else {
          io.to(roomId).emit("newMessage", "Not enough balance");
        }

        // Notify mentioned users
        if (mentionedUsers?.length > 0) {
          const usersToNotify = await User.find({
            _id: { $in: mentionedUsers },
          });
          usersToNotify.forEach((user) =>
            sendNotification(user, `You were mentioned in a chat!`)
          );
        }
      }
    );

    socket.on(
      "sendThreadMessage",
      async ({ userId, roomId, text, replyTo, mentionedUsers }) => {
        // console.log(userId, roomId, text, replyTo);
        let message = await Message.create({
          sender: userId,
          room: roomId,
          text,
          replyTo,
          mentionedUsers,
        });
        message = await message.populate("sender");
        io.to(roomId).emit("newMessage", message);

        // Notify mentioned users
        if (mentionedUsers?.length > 0) {
          const usersToNotify = await User.find({
            _id: { $in: mentionedUsers },
          });
          usersToNotify.forEach((user) =>
            sendNotification(user, `You were mentioned in a chat!`)
          );
        }
      }
    );

    socket.on("disconnect", () => {
      // console.log("User disconnected");
    });
  });

  return io;
};

module.exports = setupSocket;
