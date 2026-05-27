const db = require("../config/db");
const { isPositiveInteger, isRating } = require("../utils/validation");

async function rateContent(req, res) {
  try {
    const userId = req.user.id;
    const { content_id, rating } = req.body;

    if (!isPositiveInteger(content_id) || !isRating(rating)) {
      return res.status(400).json({
        message: "Valid content_id and rating are required",
      });
    }

    const result = await db.query(
      `
      INSERT INTO user_ratings (user_id, content_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, content_id)
      DO UPDATE SET rating = EXCLUDED.rating
      RETURNING *
      `,
      [userId, Number(content_id), Number(rating)]
    );

    res.json({
      message: "Rating saved",
      rating: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getMyRatings(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT 
        user_ratings.id AS rating_id,
        user_ratings.rating AS user_rating,
        content.*
      FROM user_ratings
      JOIN content ON user_ratings.content_id = content.id
      WHERE user_ratings.user_id = $1
      ORDER BY user_ratings.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getMyContentRating(req, res) {
  try {
    const userId = req.user.id;
    const { contentId } = req.params;

    if (!isPositiveInteger(contentId)) {
      return res.status(400).json({
        message: "Valid contentId is required",
      });
    }

    const result = await db.query(
      `
      SELECT *
      FROM user_ratings
      WHERE user_id = $1
      AND content_id = $2
      `,
      [userId, Number(contentId)]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteMyContentRating(req, res) {
  try {
    const userId = req.user.id;
    const { contentId } = req.params;

    if (!isPositiveInteger(contentId)) {
      return res.status(400).json({
        message: "Valid contentId is required",
      });
    }

    const result = await db.query(
      `
      DELETE FROM user_ratings
      WHERE user_id = $1
      AND content_id = $2
      RETURNING *
      `,
      [userId, Number(contentId)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.json({ message: "Rating deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  rateContent,
  getMyRatings,
  getMyContentRating,
  deleteMyContentRating,
};
