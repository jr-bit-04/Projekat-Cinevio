const express = require("express");

const {
  searchMovies,
  searchSeries,
  getMovieExtras,
  getSeriesDetails,
  getSeriesSeason,
} = require("../controllers/tmdbController");

const router = express.Router();

router.get("/movies", searchMovies);

router.get("/series", searchSeries);

router.get("/movies/:contentId/extras", getMovieExtras);

router.get("/series/:contentId/details", getSeriesDetails);

router.get("/series/:contentId/seasons/:seasonNumber", getSeriesSeason);

module.exports = router;
