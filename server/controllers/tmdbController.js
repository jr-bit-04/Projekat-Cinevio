const axios = require("axios");
const { isNonEmptyString, normalizeString } = require("../utils/validation");

async function searchMovies(req, res) {
  try {
    const { query } = req.query;

    if (!isNonEmptyString(query)) {
      return res.status(400).json({
        message: "Query is required",
      });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query: normalizeString(query),
        },
      }
    );

    res.json(response.data.results);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "TMDB search failed",
    });
  }
}

async function searchSeries(req, res) {
  try {
    const { query } = req.query;

    if (!isNonEmptyString(query)) {
      return res.status(400).json({
        message: "Query is required",
      });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/search/tv`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query: normalizeString(query),
        },
      }
    );

    res.json(response.data.results);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "TMDB search failed",
    });
  }
}

module.exports = {
  searchMovies,
  searchSeries,
};
