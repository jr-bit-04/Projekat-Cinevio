const express = require("express");

const {
  createContentRequest,
  getMyContentRequests,
  getAllContentRequests,
  reviewContentRequest,
} = require("../controllers/contentRequestController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createContentRequest);

router.get("/mine", protect, getMyContentRequests);

router.get("/", protect, adminOnly, getAllContentRequests);

router.patch("/:id/review", protect, adminOnly, reviewContentRequest);

module.exports = router;
