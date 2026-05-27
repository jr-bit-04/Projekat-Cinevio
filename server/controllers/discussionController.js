const db = require("../config/db");
const {
  isNonEmptyString,
  isPositiveInteger,
  normalizeString,
} = require("../utils/validation");

async function createDiscussion(req, res) {
  try {
    const userId = req.user.id;
    const { content_id, title, body } = req.body;

    if (
      !isPositiveInteger(content_id) ||
      !isNonEmptyString(title) ||
      !isNonEmptyString(body)
    ) {
      return res.status(400).json({
        message: "Valid content_id, title and body are required",
      });
    }

    const result = await db.query(
      `
      INSERT INTO discussions (user_id, content_id, title, body)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [userId, Number(content_id), normalizeString(title), normalizeString(body)]
    );

    res.status(201).json({
      message: "Discussion created",
      discussion: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getContentDiscussions(req, res) {
  try {
    const { contentId } = req.params;

    if (!isPositiveInteger(contentId)) {
      return res.status(400).json({ message: "Valid contentId is required" });
    }

    const result = await db.query(
      `
      SELECT discussions.*, users.username
      FROM discussions
      JOIN users ON discussions.user_id = users.id
      WHERE discussions.content_id = $1
      ORDER BY discussions.created_at DESC
      `,
      [contentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateDiscussion(req, res) {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";
    const { discussionId } = req.params;
    const { title, body } = req.body;

    if (
      !isPositiveInteger(discussionId) ||
      !isNonEmptyString(title) ||
      !isNonEmptyString(body)
    ) {
      return res.status(400).json({
        message: "Valid discussionId, title and body are required",
      });
    }

    const result = await db.query(
      `
      UPDATE discussions
      SET title = $1,
          body = $2
      WHERE id = $3
      AND ($4 = true OR user_id = $5)
      RETURNING *
      `,
      [
        normalizeString(title),
        normalizeString(body),
        Number(discussionId),
        isAdmin,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.json({
      message: "Discussion updated",
      discussion: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteDiscussion(req, res) {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";
    const { discussionId } = req.params;

    if (!isPositiveInteger(discussionId)) {
      return res.status(400).json({
        message: "Valid discussionId is required",
      });
    }

    const result = await db.query(
      `
      DELETE FROM discussions
      WHERE id = $1
      AND ($2 = true OR user_id = $3)
      RETURNING *
      `,
      [Number(discussionId), isAdmin, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    res.json({ message: "Discussion deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createDiscussion,
  getContentDiscussions,
  updateDiscussion,
  deleteDiscussion,
};
