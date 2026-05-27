const db = require("../config/db");
const {
  isNonEmptyString,
  isPositiveInteger,
  normalizeString,
} = require("../utils/validation");

async function saveEpisode(req, res) {
  try {
    const userId = req.user.id;

    const {
      content_id,
      season_number,
      episode_number,
      title,
      is_favorite,
      comment,
    } = req.body;

    if (
      !isPositiveInteger(content_id) ||
      !isPositiveInteger(season_number) ||
      !isPositiveInteger(episode_number) ||
      !isNonEmptyString(title)
    ) {
      return res.status(400).json({
        message:
          "Valid content_id, season_number, episode_number and title are required",
      });
    }

    const result = await db.query(
      `
      INSERT INTO episodes
      (
        user_id,
        content_id,
        season_number,
        episode_number,
        title,
        is_favorite,
        comment
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, content_id, season_number, episode_number)
      DO UPDATE SET
        title = EXCLUDED.title,
        is_favorite = EXCLUDED.is_favorite,
        comment = EXCLUDED.comment
      RETURNING *
      `,
      [
        userId,
        Number(content_id),
        Number(season_number),
        Number(episode_number),
        normalizeString(title),
        Boolean(is_favorite),
        normalizeString(comment) || "",
      ]
    );

    res.json({
      message: "Episode saved",
      episode: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getSeriesEpisodes(req, res) {
  try {
    const userId = req.user.id;
    const { contentId } = req.params;

    const result = await db.query(
      `
      SELECT *
      FROM episodes
      WHERE user_id = $1
      AND content_id = $2
      ORDER BY season_number ASC, episode_number ASC
      `,
      [userId, contentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function deleteEpisode(req, res) {
  try {
    const userId = req.user.id;
    const { episodeId } = req.params;

    if (!isPositiveInteger(episodeId)) {
      return res.status(400).json({
        message: "Valid episodeId is required",
      });
    }

    const result = await db.query(
      `
      DELETE FROM episodes
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [Number(episodeId), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Episode not found" });
    }

    res.json({ message: "Episode deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  saveEpisode,
  getSeriesEpisodes,
  deleteEpisode,
};
