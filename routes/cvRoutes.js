const express = require("express");
const cvController = require("../controllers/cvController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/getMyCv", authController.protect, cvController.getMyCv);

router.post(
  "/createCv",
  authController.protect,
  cvController.uploadUserPhoto,
  cvController.resizeUserPhoto,
  cvController.saveFiles,
  cvController.createCv
);

router.patch(
  "/updateCv",
  authController.protect,
  cvController.uploadUserPhoto,
  cvController.resizeUserPhoto,
  cvController.saveFiles,
  cvController.updateCv
);

router.post(
  "/setRating/:userId",
  authController.protect,
  authController.restrictTo("admin"),
  cvController.setRating
);

module.exports = router;
