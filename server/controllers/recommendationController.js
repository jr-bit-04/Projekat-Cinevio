const db = require("../config/db");

async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;

    const favoriteGenres = await db.query(
      `
      SELECT content.genre
      FROM user_ratings
      JOIN content ON user_ratings.content_id = content.id
      WHERE user_ratings.user_id = $1
      AND user_ratings.rating >= 8
      GROUP BY content.genre
      ORDER BY COUNT(*) DESC
      LIMIT 3
      `,
      [userId]
    );

    const genres = [
      ...new Set(
        favoriteGenres.rows
          .flatMap((item) => String(item.genre || "").split(","))
          .map((genre) => genre.trim())
          .filter(Boolean)
      ),
    ];

    if (genres.length === 0) {
      const fallback = await db.query(
        `
        SELECT *
        FROM content
        ORDER BY rating DESC
        LIMIT 12
        `
      );

      return res.json(fallback.rows);
    }

    const result = await db.query(
      `
      SELECT *
      FROM content
      WHERE genre ILIKE ANY($1)
      AND NOT EXISTS (
      SELECT 1 FROM watchlist
      WHERE watchlist.content_id = content.id
      AND watchlist.user_id = $2
      AND watchlist.status = 'watched'
      )
      ORDER BY rating DESC
      LIMIT 12
      `,
      [genres.map((genre) => `%${genre}%`), userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getRecommendations,
};
