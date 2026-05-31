const axios = require("axios");
const db = require("../config/db");
const {
  isNonEmptyString,
  isPositiveInteger,
  isRating,
  normalizeString,
} = require("../utils/validation");

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

async function createContent(req, res) {
  try {
    const {
      title,
      type,
      description,
      release_year,
      genre,
      rating,
      poster_url,
      backdrop_url,
      trailer_url,
    } = req.body;

    if (
      !isNonEmptyString(title) ||
      !["movie", "series"].includes(type) ||
      !isNonEmptyString(description) ||
      !isPositiveInteger(release_year) ||
      !isNonEmptyString(genre) ||
      !isRating(rating)
    ) {
      return res.status(400).json({
        message:
          "title, type, description, release_year, genre and rating are required",
      });
    }

    const result = await db.query(
      `
      INSERT INTO content
      (
        title, type, description, release_year, genre,
        rating, poster_url, backdrop_url, trailer_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        normalizeString(title),
        type,
        normalizeString(description),
        Number(release_year),
        normalizeString(genre),
        Number(rating),
        normalizeString(poster_url) || null,
        normalizeString(backdrop_url) || null,
        normalizeString(trailer_url) || "",
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getAllContent(req, res) {
  try {
    const result = await db.query(`
      SELECT * FROM content
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getTrendingContent(req, res) {
  try {
    const limit = isPositiveInteger(req.query.limit)
      ? Math.min(Number(req.query.limit), 50)
      : 12;

    const result = await db.query(
      `
      SELECT
        content.*,
        COALESCE(w.watched_count, 0) AS watched_count,
        COALESCE(w.interaction_count, 0) AS interaction_count,
        COALESCE(r.rating_count, 0) AS rating_count,
        COALESCE(r.avg_user_rating, 0) AS avg_user_rating
      FROM content
      LEFT JOIN (
        SELECT
          content_id,
          COUNT(*) FILTER (WHERE status = 'watched') AS watched_count,
          COUNT(*) AS interaction_count
        FROM watchlist
        GROUP BY content_id
      ) w ON w.content_id = content.id
      LEFT JOIN (
        SELECT
          content_id,
          COUNT(*) AS rating_count,
          AVG(rating) AS avg_user_rating
        FROM user_ratings
        GROUP BY content_id
      ) r ON r.content_id = content.id
      ORDER BY
        (
          COALESCE(w.watched_count, 0) * 3 +
          COALESCE(w.interaction_count, 0) * 1 +
          COALESCE(r.rating_count, 0) * 2
        ) DESC,
        COALESCE(r.avg_user_rating, 0) DESC,
        content.rating DESC,
        content.created_at DESC
      LIMIT $1
      `,
      [limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getSingleContent(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT * FROM content
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateContent(req, res) {
  try {
    const { id } = req.params;

    const {
      title,
      type,
      description,
      release_year,
      genre,
      rating,
      poster_url,
      backdrop_url,
      trailer_url,
    } = req.body;

    if (
      !isNonEmptyString(title) ||
      !["movie", "series"].includes(type) ||
      !isNonEmptyString(description) ||
      !isPositiveInteger(release_year) ||
      !isNonEmptyString(genre) ||
      !isRating(rating)
    ) {
      return res.status(400).json({
        message:
          "title, type, description, release_year, genre and rating are required",
      });
    }

    const result = await db.query(
      `
      UPDATE content
      SET
        title = $1,
        type = $2,
        description = $3,
        release_year = $4,
        genre = $5,
        rating = $6,
        poster_url = $7,
        backdrop_url = $8,
        trailer_url = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        normalizeString(title),
        type,
        normalizeString(description),
        Number(release_year),
        normalizeString(genre),
        Number(rating),
        normalizeString(poster_url) || null,
        normalizeString(backdrop_url) || null,
        normalizeString(trailer_url) || "",
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json({
      message: "Content updated",
      content: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteContent(req, res) {
  try {
    const { id } = req.params;

    await db.query(
      `
      DELETE FROM content
      WHERE id = $1
      `,
      [id]
    );

    res.json({ message: "Content deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function searchContent(req, res) {
  try {
    const { query, type } = req.query;

    if (!isNonEmptyString(query) || !["movie", "series"].includes(type)) {
      return res.status(400).json({
        message: "Valid query and type are required",
      });
    }

    const localResult = await db.query(
      `
      SELECT *
      FROM content
      WHERE LOWER(title) LIKE LOWER($1)
      AND type = $2
      ORDER BY rating DESC
      `,
      [`%${normalizeString(query)}%`, type]
    );

    if (localResult.rows.length > 0) {
      return res.json(localResult.rows);
    }

    const tmdbEndpoint =
      type === "movie"
        ? "https://api.themoviedb.org/3/search/movie"
        : "https://api.themoviedb.org/3/search/tv";

    const tmdbResponse = await axios.get(tmdbEndpoint, {
      params: {
        api_key: process.env.TMDB_API_KEY,
          query: normalizeString(query),
      },
    });

    const results = tmdbResponse.data.results.slice(0, 10);
    const savedItems = [];

    for (const item of results) {
      const title = type === "movie" ? item.title : item.name;
      const releaseDate =
        type === "movie" ? item.release_date : item.first_air_date;

      const inserted = await db.query(
        `
        INSERT INTO content
        (
          tmdb_id, title, type, description, release_year,
          genre, rating, poster_url, backdrop_url, trailer_url
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (tmdb_id, type)
        DO UPDATE SET title = EXCLUDED.title
        RETURNING *
        `,
        [
          item.id,
          title,
          type,
          item.overview,
          releaseDate ? Number(releaseDate.slice(0, 4)) : null,
          item.genre_ids
            ?.map((id) => genreMap[id])
            .filter(Boolean)
            .join(", ") || "Unknown",
          item.vote_average,
          item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null,
          item.backdrop_path
            ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
            : null,
          "",
        ]
      );

      savedItems.push(inserted.rows[0]);
    }

    res.json(savedItems);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Search failed" });
  }
}

module.exports = {
  createContent,
  getAllContent,
  getTrendingContent,
  getSingleContent,
  updateContent,
  deleteContent,
  searchContent,
};
