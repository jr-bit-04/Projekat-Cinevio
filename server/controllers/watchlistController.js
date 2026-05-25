const db = require("../config/db");
const { isPositiveInteger } = require("../utils/validation");

async function addToWatchlist(req, res) {
  try {
    const userId = req.user.id;
    const { content_id, status } = req.body;
    const nextStatus = status || "watchlist";

    if (!isPositiveInteger(content_id) || !["watchlist", "watched"].includes(nextStatus)) {
      return res.status(400).json({
        message: "Valid content_id and status are required",
      });
    }

    const existing = await db.query(
      `
      SELECT id
      FROM watchlist
      WHERE user_id = $1 AND content_id = $2
      `,
      [userId, Number(content_id)]
    );

    const result =
      existing.rows.length > 0
        ? await db.query(
            `
            UPDATE watchlist
            SET status = $1
            WHERE id = $2 AND user_id = $3
            RETURNING *
            `,
            [nextStatus, existing.rows[0].id, userId]
          )
        : await db.query(
            `
            INSERT INTO watchlist (user_id, content_id, status)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [userId, Number(content_id), nextStatus]
          );

    res.status(201).json({
      message: "Added to watchlist",
      item: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getMyWatchlist(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT 
        watchlist.id AS watchlist_id,
        watchlist.status,
        content.*
      FROM watchlist
      JOIN content ON watchlist.content_id = content.id
      WHERE watchlist.user_id = $1
      ORDER BY watchlist.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function removeFromWatchlist(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query(
      `
      DELETE FROM watchlist
      WHERE id = $1 AND user_id = $2
      `,
      [id, userId]
    );

    res.json({ message: "Removed from watchlist" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  addToWatchlist,
  getMyWatchlist,
  removeFromWatchlist,
};
