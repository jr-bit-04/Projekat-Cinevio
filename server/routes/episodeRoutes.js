const express = require("express");

const {
  saveEpisode,
  getSeriesEpisodes,
  deleteEpisode,
} = require("../controllers/episodeController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, saveEpisode);

router.get("/:contentId", protect, getSeriesEpisodes);

router.delete("/:episodeId", protect, deleteEpisode);

module.exports = router;
