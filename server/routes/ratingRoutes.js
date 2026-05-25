const express = require("express");

const {
  rateContent,
  getMyRatings,
} = require("../controllers/ratingController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, rateContent);

router.get("/", protect, getMyRatings);

module.exports = router;