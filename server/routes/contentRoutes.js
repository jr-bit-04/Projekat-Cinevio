const express = require("express");

const {
  createContent,
  getAllContent,
  getTrendingContent,
  getSingleContent,
  updateContent,
  deleteContent,
  searchContent,
} = require("../controllers/contentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllContent);

router.get("/search", searchContent);

router.get("/trending", getTrendingContent);

router.get("/:id", getSingleContent);

router.post("/", protect, adminOnly, createContent);

router.put("/:id", protect, adminOnly, updateContent);

router.delete("/:id", protect, adminOnly, deleteContent);

module.exports = router;