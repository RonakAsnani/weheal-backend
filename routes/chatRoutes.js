// routes/chatRoutes.js
const express = require("express");
const {
  getMessages,
  createChatRoom,
  getGroups,
  fetchRoomMessages,
  fetchReplyMessages,
} = require("../controllers/chatController");
const router = express.Router();

router.get("/:roomId/messages", getMessages);
router.get("/get-groups", getGroups);
router.post("/room", createChatRoom);
router.get("/get-messages", fetchRoomMessages);
router.get("/get-replies", fetchReplyMessages);

module.exports = router;
