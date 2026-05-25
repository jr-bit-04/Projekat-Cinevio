const express = require("express");

const {
  searchMovies,
  searchSeries,
} = require("../controllers/tmdbController");

const router = express.Router();

router.get("/movies", searchMovies);

router.get("/series", searchSeries);

module.exports = router;