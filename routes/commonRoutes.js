const express = require("express");
const commonController = require("../controllers/commonController");

const router = express.Router();

router.post("/message", commonController.message);

module.exports = router;
