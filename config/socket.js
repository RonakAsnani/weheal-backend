const { Server } = require("socket.io");
const Message = require("../models/messageModel");
const ChatRoom = require("../models/chatRoomModel");
const User = require("../models/userModel");
const { sendNotification } = require("../utils/notificationService");

const setupSocket = (server) => {
  console.log("setting");
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
      async ({ userId, roomId, text, replyTo, mentionedUsers }) => {
        console.log(userId, roomId, text, replyTo);
        const message = await Message.create({
          sender: userId,
          room: roomId,
          text,
          replyTo,
          mentionedUsers,
        });
        console.log(message);
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

    socket.on(
      "sendThreadMessage",
      async ({ userId, roomId, text, replyTo, mentionedUsers }) => {
        console.log(userId, roomId, text, replyTo);
        const message = await Message.create({
          sender: userId,
          room: roomId,
          text,
          replyTo,
          mentionedUsers,
        });
        console.log(message);
        // io.to(roomId).emit("newMessage", message);

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
      console.log("User disconnected");
    });
  });

  return io;
};

module.exports = setupSocket;
