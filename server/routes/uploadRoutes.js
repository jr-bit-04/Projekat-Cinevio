const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/image",
  protect,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }

    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:5000";

    res.json({
      message: "Image uploaded successfully",
      imageUrl: `${appBaseUrl}/uploads/${req.file.filename}`,
    });
  }
);

module.exports = router;
