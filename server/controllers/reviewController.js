const db = require("../config/db");
const {
  isNonEmptyString,
  isPositiveInteger,
  normalizeString,
} = require("../utils/validation");

async function createReview(req, res) {
  try {
    const userId = req.user.id;

    const {
      content_id,
      review_text,
    } = req.body;

    if (!isPositiveInteger(content_id) || !isNonEmptyString(review_text)) {
      return res.status(400).json({
        message: "Valid content_id and review_text are required",
      });
    }

    const result = await db.query(
      `
      INSERT INTO reviews
      (
        user_id,
        content_id,
        review_text
      )

      VALUES ($1, $2, $3)

      RETURNING *
      `,
      [
        userId,
        Number(content_id),
        normalizeString(review_text),
      ]
    );

    res.status(201).json({
      message: "Review created",
      review: result.rows[0],
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
}

async function getContentReviews(req, res) {
  try {
    const { contentId } = req.params;

    const result = await db.query(
      `
      SELECT
        reviews.*,
        users.username

      FROM reviews

      JOIN users
      ON reviews.user_id = users.id

      WHERE reviews.content_id = $1

      ORDER BY reviews.created_at DESC
      `,
      [contentId]
    );

    res.json(result.rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
}

module.exports = {
  createReview,
  getContentReviews,
};
