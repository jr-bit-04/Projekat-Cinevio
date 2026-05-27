const express = require("express");

const {
  createReview,
  deleteReview,
  getContentReviews,
  updateReview,
} = require("../controllers/reviewController");

const {
  attachUserIfAuthenticated,
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);

router.get("/:contentId", attachUserIfAuthenticated, getContentReviews);

router.put("/:reviewId", protect, updateReview);

router.delete("/:reviewId", protect, deleteReview);

module.exports = router;
