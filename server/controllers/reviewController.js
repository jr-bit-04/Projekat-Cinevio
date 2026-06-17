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
      is_public,
    } = req.body;

    /*if (normalizeString(review_text).length > 1000) {
      return res.status(400).json({ message: "Review too long (max 1000)" });
    }*/

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
        review_text,
        is_public
      )

      VALUES ($1, $2, $3, $4)

      RETURNING *
      `,
      [
        userId,
        Number(content_id),
        normalizeString(review_text),
        is_public !== false,
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

    if (!isPositiveInteger(contentId)) {
      return res.status(400).json({
        message: "Valid contentId is required",
      });
    }

    const userId = req.user?.id || null;
    const isAdmin = req.user?.role === "admin";

    const result = await db.query(
      `
      SELECT
        reviews.*,
        users.username

      FROM reviews

      JOIN users
      ON reviews.user_id = users.id

      WHERE reviews.content_id = $1
      AND (
        reviews.is_public = true
        OR $2 = true
        OR reviews.user_id = $3
      )

      ORDER BY reviews.created_at DESC
      `,
      [Number(contentId), isAdmin, userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
}

async function updateReview(req, res) {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";
    const { reviewId } = req.params;
    const { review_text, is_public } = req.body;

    if (!isPositiveInteger(reviewId) || !isNonEmptyString(review_text)) {
      return res.status(400).json({
        message: "Valid reviewId and review_text are required",
      });
    }

    const result = await db.query(
      `
      UPDATE reviews
      SET review_text = $1,
          is_public = $2
      WHERE id = $3
      AND ($4 = true OR user_id = $5)
      RETURNING *
      `,
      [
        normalizeString(review_text),
        is_public !== false,
        Number(reviewId),
        isAdmin,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      message: "Review updated",
      review: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
}

async function deleteReview(req, res) {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";
    const { reviewId } = req.params;

    if (!isPositiveInteger(reviewId)) {
      return res.status(400).json({
        message: "Valid reviewId is required",
      });
    }

    const result = await db.query(
      `
      DELETE FROM reviews
      WHERE id = $1
      AND ($2 = true OR user_id = $3)
      RETURNING *
      `,
      [Number(reviewId), isAdmin, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review deleted" });
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
  updateReview,
  deleteReview,
};
