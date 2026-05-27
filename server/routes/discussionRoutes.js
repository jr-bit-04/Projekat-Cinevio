const express = require("express");

const {
  createDiscussion,
  deleteDiscussion,
  getContentDiscussions,
  updateDiscussion,
} = require("../controllers/discussionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createDiscussion);

router.get("/:contentId", getContentDiscussions);

router.put("/:discussionId", protect, updateDiscussion);

router.delete("/:discussionId", protect, deleteDiscussion);

module.exports = router;
