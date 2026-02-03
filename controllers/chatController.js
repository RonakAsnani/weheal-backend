// controllers/chatController.js
const ChatRoom = require("../models/chatRoomModel");
const Messages = require("../models/messageModel");
const Message = require("../models/messageModel");

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ room: roomId })
      .populate("sender")
      .populate("replyTo");
    return res.status(201).json(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

exports.createChatRoom = async (req, res) => {
  try {
    const { userId, expertId } = req.body;
    const name = userId + expertId;
    const roomExist = await ChatRoom.findOne({ name });
    if (roomExist) {
      return res.status(201).json(roomExist);
    }
    const chatRoom = await ChatRoom.create({
      name,
      users: [userId, expertId],
      isGroup: false,
    });
    return res.status(201).json(chatRoom);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groupList = await ChatRoom.find({ isGroup: true });

    return res.status(201).json({
      groupList,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server error" });
  }
};

exports.fetchRoomMessages = async (req, res) => {
  try {
    const { roomId, lastMessageId, type } = req.query; // Last message ID for pagination
    const pageSize = 25; // Number of messages per request
    let query = { room: roomId, replyTo: null };
    if (lastMessageId) {
      // Fetch older messages than lastMessageId
      query._id = { $lt: lastMessageId };
    }
    const messages = await Messages.find(query)
      .sort({ createdAt: -1 }) // Fetch latest first
      .limit(pageSize)
      .populate("sender"); // Populate sender info

    if (type == "group") {
      return res.status(201).json({ messages: messages });
    }
    const reversedMessages = messages.reverse();
    return res.status(201).json({ messages: reversedMessages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

exports.fetchReplyMessages = async (req, res) => {
  try {
    const { replyTo } = req.query;

    const messages = await Messages.find({ replyTo })
      .populate("sender")
      .sort({ createdAt: -1 });

    return res.status(201).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server error" });
  }
};
