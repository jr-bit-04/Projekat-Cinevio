const db = require("../config/db");
const { isPositiveInteger } = require("../utils/validation");

async function getActivityFeed(req, res) {
  try {
    const limit = isPositiveInteger(req.query.limit)
      ? Math.min(Number(req.query.limit), 200)
      : 100;

    const result = await db.query(
      `
      SELECT * FROM (
        SELECT
          'watchlist' AS activity_type,
          w.id AS source_id,
          w.user_id,
          u.username,
          u.email,
          w.content_id,
          c.title AS content_title,
          c.type AS content_type,
          w.status AS detail,
          w.created_at
        FROM watchlist w
        JOIN users u ON u.id = w.user_id
        LEFT JOIN content c ON c.id = w.content_id

        UNION ALL

        SELECT
          'rating',
          r.id,
          r.user_id,
          u.username,
          u.email,
          r.content_id,
          c.title,
          c.type,
          r.rating::text,
          r.created_at
        FROM user_ratings r
        JOIN users u ON u.id = r.user_id
        LEFT JOIN content c ON c.id = r.content_id

        UNION ALL

        SELECT
          'review',
          rv.id,
          rv.user_id,
          u.username,
          u.email,
          rv.content_id,
          c.title,
          c.type,
          LEFT(rv.review_text, 140),
          rv.created_at
        FROM reviews rv
        JOIN users u ON u.id = rv.user_id
        LEFT JOIN content c ON c.id = rv.content_id

        UNION ALL

        SELECT
          'discussion',
          d.id,
          d.user_id,
          u.username,
          u.email,
          d.content_id,
          c.title,
          c.type,
          d.title,
          d.created_at
        FROM discussions d
        JOIN users u ON u.id = d.user_id
        LEFT JOIN content c ON c.id = d.content_id
      ) AS activity
      ORDER BY created_at DESC
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

module.exports = {
  getActivityFeed,
};
