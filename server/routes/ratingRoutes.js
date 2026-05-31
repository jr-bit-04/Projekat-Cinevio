const express = require("express");

const {
  deleteMyContentRating,
  rateContent,
  getMyRatings,
  getMyContentRating,
  getContentRatingStats,
} = require("../controllers/ratingController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, rateContent);

router.get("/", protect, getMyRatings);

router.get("/stats/:contentId", getContentRatingStats);

router.get("/:contentId", protect, getMyContentRating);

router.delete("/:contentId", protect, deleteMyContentRating);

module.exports = router;
