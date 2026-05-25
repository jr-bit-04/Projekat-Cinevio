const express = require("express");

const {
  createReview,
  getContentReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);

router.get("/:contentId", getContentReviews);

module.exports = router;