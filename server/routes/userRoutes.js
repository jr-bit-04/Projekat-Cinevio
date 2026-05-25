const express = require("express");
const db = require("../config/db");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.get("/admin-test", protect, adminOnly, (req, res) => {
  res.json({
    message: "Admin route works",
  });
});

module.exports = router;