const axios = require("axios");
require("dotenv").config();

const db = require("../config/db");

const genreMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10765: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

function formatGenres(genres = []) {
  return (
    genres
      .map((genre) => genreMap[genre.id] || genre.name)
      .filter(Boolean)
      .join(", ") || "Unknown"
  );
}

async function fetchTmdbGenres(item) {
  const mediaType = item.type === "movie" ? "movie" : "tv";
  const endpoint = `https://api.themoviedb.org/3/${mediaType}/${item.tmdb_id}`;

  const response = await axios.get(endpoint, {
    params: {
      api_key: process.env.TMDB_API_KEY,
    },
    timeout: 10000,
  });

  return formatGenres(response.data.genres);
}

async function backfillGenres() {
  if (!process.env.TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is missing from .env");
  }

  const result = await db.query(`
    SELECT id, tmdb_id, title, type
    FROM content
    WHERE UPPER(genre) = 'TMDB'
    AND tmdb_id IS NOT NULL
  `);

  if (result.rows.length === 0) {
    console.log("No old TMDB genre rows found.");
    return;
  }

  console.log(`Found ${result.rows.length} old TMDB genre rows.`);

  for (const item of result.rows) {
    try {
      const genre = await fetchTmdbGenres(item);

      await db.query(
        `
        UPDATE content
        SET genre = $1
        WHERE id = $2
        `,
        [genre, item.id]
      );

      console.log(`Updated ${item.title}: ${genre}`);
    } catch (error) {
      const message =
        error.response?.data?.status_message ||
        error.response?.statusText ||
        error.code ||
        error.message ||
        "Unknown error";

      console.log(`Skipped ${item.title}: ${message}`);
    }
  }
}

backfillGenres()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
