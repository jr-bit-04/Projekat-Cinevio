const db = require("../config/db");
const { isPositiveInteger } = require("../utils/validation");

async function addToTopList(req, res) {
  try {
    const userId = req.user.id;
    const { content_id, list_type, position } = req.body;

    if (
      !isPositiveInteger(content_id) ||
      !["top_movies", "top_series"].includes(list_type) ||
      (position && !isPositiveInteger(position))
    ) {
      return res.status(400).json({
        message: "Valid content_id, list_type and position are required",
      });
    }

    const existing = await db.query(
      `
      SELECT id
      FROM top_lists
      WHERE user_id = $1 AND content_id = $2 AND list_type = $3
      `,
      [userId, Number(content_id), list_type]
    );

    const result =
      existing.rows.length > 0
        ? await db.query(
            `
            UPDATE top_lists
            SET position = $1
            WHERE id = $2 AND user_id = $3
            RETURNING *
            `,
            [position ? Number(position) : null, existing.rows[0].id, userId]
          )
        : await db.query(
            `
            INSERT INTO top_lists (user_id, content_id, list_type, position)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [userId, Number(content_id), list_type, position ? Number(position) : null]
          );

    res.status(201).json({
      message: "Added to top list",
      item: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getTopList(req, res) {
  try {
    const userId = req.user.id;
    const { listType } = req.params;

    const result = await db.query(
      `
      SELECT 
        top_lists.id AS top_id,
        top_lists.position,
        content.*
      FROM top_lists
      JOIN content ON top_lists.content_id = content.id
      WHERE top_lists.user_id = $1
      AND top_lists.list_type = $2
      ORDER BY top_lists.position ASC, top_lists.created_at DESC
      `,
      [userId, listType]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function removeFromTopList(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
    `DELETE FROM top_lists WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not found in top list" });
    }

    res.json({ message: "Removed from top list" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  addToTopList,
  getTopList,
  removeFromTopList,
};
