const express = require("express");

const {
  deleteMyContentRating,
  rateContent,
  getMyRatings,
  getMyContentRating,
} = require("../controllers/ratingController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, rateContent);

router.get("/", protect, getMyRatings);

router.get("/:contentId", protect, getMyContentRating);

router.delete("/:contentId", protect, deleteMyContentRating);

module.exports = router;
