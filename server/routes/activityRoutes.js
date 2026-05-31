const express = require("express");

const { getActivityFeed } = require("../controllers/activityController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getActivityFeed);

module.exports = router;
