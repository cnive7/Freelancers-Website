const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const landingConfigController = require("../controllers/landingConfigController");

router.post(
  "/createLandingConfig",
  authController.protect,
  authController.restrictTo("admin"),
  landingConfigController.createLandingConfig
);
router.patch(
  "/updateLandingConfig",
  landingConfigController.updateLandingConfig
);

module.exports = router;
