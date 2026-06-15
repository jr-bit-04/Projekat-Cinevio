const db = require("../config/db");
const {
  isNonEmptyString,
  isPositiveInteger,
  isRating,
  normalizeString,
} = require("../utils/validation");

let tableReady = false;

async function ensureContentRequestsTable() {
  if (tableReady) return;

  await db.query(`
    CREATE TABLE IF NOT EXISTS content_requests (
      id SERIAL PRIMARY KEY,
      requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('movie', 'series')),
      description TEXT NOT NULL,
      release_year INTEGER NOT NULL,
      genre VARCHAR(255) NOT NULL,
      rating NUMERIC(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
      poster_url TEXT,
      backdrop_url TEXT,
      trailer_url TEXT DEFAULT '',
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
      admin_note TEXT,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  tableReady = true;
}

function getMissingContentFields(body) {
  const missing = [];

  if (!isNonEmptyString(body.title)) missing.push("Title");
  if (!["movie", "series"].includes(body.type)) missing.push("Type");
  if (!isNonEmptyString(body.description)) missing.push("Description");
  if (!isPositiveInteger(body.release_year)) missing.push("Release year");
  if (!isNonEmptyString(body.genre)) missing.push("Genre");
  if (!isRating(body.rating)) missing.push("Rating (0-10)");

  return missing;
}

function buildContentValues(body) {
  return [
    normalizeString(body.title),
    body.type,
    normalizeString(body.description),
    Number(body.release_year),
    normalizeString(body.genre),
    Number(body.rating),
    normalizeString(body.poster_url) || null,
    normalizeString(body.backdrop_url) || null,
    normalizeString(body.trailer_url) || "",
  ];
}

async function createContentRequest(req, res) {
  try {
    await ensureContentRequestsTable();

    const missing = getMissingContentFields(req.body);

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Please fill in correctly: ${missing.join(", ")}`,
      });
    }

    const result = await db.query(
      `
      INSERT INTO content_requests
      (
        requested_by, title, type, description, release_year, genre,
        rating, poster_url, backdrop_url, trailer_url
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [req.user.id, ...buildContentValues(req.body)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getMyContentRequests(req, res) {
  try {
    await ensureContentRequestsTable();

    const result = await db.query(
      `
      SELECT *
      FROM content_requests
      WHERE requested_by = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function getAllContentRequests(req, res) {
  try {
    await ensureContentRequestsTable();

    const result = await db.query(`
      SELECT
        content_requests.*,
        users.username AS requested_by_username,
        users.email AS requested_by_email
      FROM content_requests
      LEFT JOIN users ON content_requests.requested_by = users.id
      ORDER BY
        CASE content_requests.status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          ELSE 3
        END,
        content_requests.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function reviewContentRequest(req, res) {
  try {
    await ensureContentRequestsTable();

    const { id } = req.params;
    const { status, admin_note } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected",
      });
    }

    const requestResult = await db.query(
      `
      SELECT *
      FROM content_requests
      WHERE id = $1
      `,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    const contentRequest = requestResult.rows[0];

    if (contentRequest.status !== "pending") {
      return res.status(409).json({
        message: "Request has already been reviewed",
      });
    }

    let createdContent = null;

    if (status === "approved") {
      const insertedContent = await db.query(
        `
        INSERT INTO content
        (
          title, type, description, release_year, genre,
          rating, poster_url, backdrop_url, trailer_url
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        buildContentValues(contentRequest)
      );

      createdContent = insertedContent.rows[0];
    }

    const reviewedRequest = await db.query(
      `
      UPDATE content_requests
      SET
        status = $1,
        admin_note = $2,
        reviewed_by = $3,
        reviewed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
      `,
      [
        status,
        normalizeString(admin_note) || null,
        req.user.id,
        id,
      ]
    );

    res.json({
      message:
        status === "approved"
          ? "Request approved and content added"
          : "Request rejected",
      request: reviewedRequest.rows[0],
      content: createdContent,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createContentRequest,
  getMyContentRequests,
  getAllContentRequests,
  reviewContentRequest,
};
