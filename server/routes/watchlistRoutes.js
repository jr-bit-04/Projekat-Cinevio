const express = require("express");
const {
  addToWatchlist,
  getMyWatchlist,
  removeFromWatchlist,
} = require("../controllers/watchlistController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addToWatchlist);
router.get("/", protect, getMyWatchlist);
router.delete("/:id", protect, removeFromWatchlist);

module.exports = router;