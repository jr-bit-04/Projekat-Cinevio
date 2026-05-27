const axios = require("axios");
const db = require("../config/db");
const { isNonEmptyString, normalizeString } = require("../utils/validation");

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

async function getContentById(contentId) {
  const result = await db.query(
    `
    SELECT id, tmdb_id, type, trailer_url
    FROM content
    WHERE id = $1
    `,
    [contentId]
  );

  return result.rows[0];
}

function mapCast(cast = []) {
  return cast.slice(0, 12).map((person) => ({
    id: person.id,
    name: person.name,
    character: person.character,
    profile_url: person.profile_path
      ? `${TMDB_IMAGE_BASE_URL}${person.profile_path}`
      : null,
  }));
}

function mapVideos(videos = []) {
  return videos
    .filter((video) => video.site === "YouTube")
    .slice(0, 8)
    .map((video) => ({
      id: video.id,
      name: video.name,
      type: video.type,
      key: video.key,
      embed_url: `https://www.youtube.com/embed/${video.key}`,
    }));
}

function mapSeasons(seasons = []) {
  return seasons
    .filter((season) => season.season_number > 0)
    .map((season) => ({
      id: season.id,
      season_number: season.season_number,
      name: season.name,
      episode_count: season.episode_count,
      air_date: season.air_date,
      poster_url: season.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${season.poster_path}`
        : null,
    }));
}

function mapEpisodes(episodes = []) {
  return episodes.map((episode) => ({
    id: episode.id,
    season_number: episode.season_number,
    episode_number: episode.episode_number,
    title: episode.name,
    overview: episode.overview,
    air_date: episode.air_date,
    rating: episode.vote_average,
    still_url: episode.still_path
      ? `${TMDB_IMAGE_BASE_URL}${episode.still_path}`
      : null,
  }));
}

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

async function getMovieExtras(req, res) {
  try {
    const { contentId } = req.params;
    const content = await getContentById(contentId);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (!content.tmdb_id || content.type !== "movie") {
      return res.json({
        cast: [],
        videos: [],
        awards: [],
        awardsMessage: "Awards are not available from TMDB for this title.",
      });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${content.tmdb_id}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          append_to_response: "credits,videos",
        },
      }
    );

    const videos = mapVideos(response.data.videos?.results);

    res.json({
      cast: mapCast(response.data.credits?.cast),
      videos,
      trailer_url: videos[0]?.embed_url || content.trailer_url || "",
      awards: [],
      awardsMessage: "Awards are not available from TMDB for this title.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "TMDB details failed" });
  }
}

async function getSeriesDetails(req, res) {
  try {
    const { contentId } = req.params;
    const content = await getContentById(contentId);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (!content.tmdb_id || content.type !== "series") {
      return res.json({
        cast: [],
        videos: [],
        seasons: [],
        awards: [],
        awardsMessage: "Awards are not available from TMDB for this title.",
      });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/${content.tmdb_id}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          append_to_response: "credits,videos",
        },
      }
    );

    const videos = mapVideos(response.data.videos?.results);

    res.json({
      status: response.data.status,
      first_air_date: response.data.first_air_date,
      last_air_date: response.data.last_air_date,
      number_of_seasons: response.data.number_of_seasons,
      number_of_episodes: response.data.number_of_episodes,
      cast: mapCast(response.data.credits?.cast),
      videos,
      trailer_url: videos[0]?.embed_url || content.trailer_url || "",
      seasons: mapSeasons(response.data.seasons),
      awards: [],
      awardsMessage: "Awards are not available from TMDB for this title.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "TMDB series details failed" });
  }
}

async function getSeriesSeason(req, res) {
  try {
    const { contentId, seasonNumber } = req.params;
    const content = await getContentById(contentId);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    if (!content.tmdb_id || content.type !== "series") {
      return res.json({ episodes: [] });
    }

    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/${content.tmdb_id}/season/${seasonNumber}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
        },
      }
    );

    res.json({
      id: response.data.id,
      name: response.data.name,
      season_number: response.data.season_number,
      overview: response.data.overview,
      episodes: mapEpisodes(response.data.episodes),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "TMDB season details failed" });
  }
}

module.exports = {
  searchMovies,
  searchSeries,
  getMovieExtras,
  getSeriesDetails,
  getSeriesSeason,
};
