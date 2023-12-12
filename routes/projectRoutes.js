const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const projectController = require("../controllers/projectController");

router.post(
  "/createProject",
  authController.protect,
  authController.restrictTo("admin"),
  projectController.uploadprojectFilesHandler,
  projectController.saveProjectFiles,
  projectController.createProject
);

router.delete(
  "/deleteProject/:id",
  authController.protect,
  authController.restrictTo("admin"),
  projectController.deleteProject
);

router.post(
  "/createProposal/:id",
  authController.protect,
  projectController.uploadFiles,
  projectController.saveFiles,
  projectController.createProposal
);

module.exports = router;
