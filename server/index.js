const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const contentRoutes = require("./routes/contentRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const topListRoutes = require("./routes/topListRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const tmdbRoutes = require("./routes/tmdbRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const episodeRoutes = require("./routes/episodeRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/top-lists", topListRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/tmdb", tmdbRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/episodes", episodeRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Cinevio API running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
