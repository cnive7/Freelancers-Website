const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const groupController = require("../controllers/groupController");
const viewsController = require("../controllers/viewsController");

router.get(
  "/getAllGroups",
  authController.protect,
  authController.restrictTo("admin"),
  groupController.getAllGroups
);

router.get(
  "/getSelectGroup/:userId",
  authController.protect,
  authController.restrictTo("admin"),
  viewsController.selectGroup
);

router.post(
  "/createGroup",
  authController.protect,
  authController.restrictTo("admin"),
  groupController.createGroup
);

router.delete(
  "/deleteGroup/:id",
  authController.protect,
  authController.restrictTo("admin"),
  groupController.deleteGroup
);

router.post(
  "/addToGroup/:userId",
  authController.protect,
  authController.restrictTo("admin"),
  groupController.addToGroup
);

router.patch(
  "/deleteFromGroup/:userId",
  authController.protect,
  authController.restrictTo("admin"),
  groupController.deleteFromGroup
);

module.exports = router;
