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
    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.createChatRoom = async (req, res) => {
  try {
    const { name, users, isGroup } = req.body;

    const chatRoom = await ChatRoom.create({ name, users, isGroup });
    res.json(chatRoom);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groupList = await ChatRoom.find({ isGroup: true });
    console.log(groupList);
    return res.status(201).json({
      groupList,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.fetchRoomMessages = async (req, res) => {
  try {
    const { roomId, lastMessageId } = req.query; // Last message ID for pagination
    console.log(roomId);
    const pageSize = 25; // Number of messages per request

    let query = { room: roomId, replyTo: null };
    if (lastMessageId) {
      // Fetch older messages than lastMessageId
      query._id = { $lt: lastMessageId };
    }
    console.log("2");
    const messages = await Messages.find(query)
      .sort({ createdAt: -1 }) // Fetch latest first
      .limit(pageSize)
      .populate("sender"); // Populate sender info
    const reversedMessages = messages.reverse();
    console.log("3");
    res.json({ messages: reversedMessages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.fetchReplyMessages = async (req, res) => {
  try {
    const { replyTo } = req.query;
    //  console.log(replyTo);
    const messages = await Messages.find({ replyTo }).populate("sender");
    //console.log(messages);
    return res.status(201).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};
