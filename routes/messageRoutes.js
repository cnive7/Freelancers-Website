const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const groupController = require("../controllers/groupController");
const viewsController = require("../controllers/viewsController");
const messageController = require("../controllers/messageController");

router.get(
  "/getAllMessages",
  authController.protect,
  messageController.getAllMessages
);

router.get("/getAdminId", authController.protect, messageController.getAdminId);

router.get(
  "/getAllMessages/:id",
  authController.protect,
  authController.restrictTo("admin"),
  messageController.getAllMessagesFromUser
);

router.get(
  "/getAllChats/:id",
  authController.protect,
  authController.restrictTo("admin"),
  messageController.getAllChats
);

router.get(
  "/setReadAllMessages/:id",
  authController.protect,
  messageController.setReadAllMessages
);

router.post(
  "/sendMessage",
  authController.protect,
  messageController.setMessageFrom,
  messageController.sendMessage
);

router.delete(
  "/deleteChat/:id",
  authController.protect,
  authController.restrictTo("admin"),
  messageController.deleteChat
);

module.exports = router;
