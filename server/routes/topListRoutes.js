const express = require("express");

const {
  addToTopList,
  getTopList,
  removeFromTopList,
} = require("../controllers/topListController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addToTopList);

router.get("/:listType", protect, getTopList);

router.delete("/:id", protect, removeFromTopList);

module.exports = router;
