import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import api from "../services/api";
import AmbientBackground from "../components/AmbientBackground";

function SeriesDetails() {
  const { id } = useParams();

  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSeason, setActiveSeason] = useState(1);

  const [episodeComments, setEpisodeComments] = useState({});
  const [reviewText, setReviewText] = useState("");
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionBody, setDiscussionBody] = useState("");
  const [reviews, setReviews] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  const seasons = [1, 2, 3];

  useEffect(() => {
    fetchSeries();
    fetchEpisodes();
    fetchReviews();
    fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchSeries() {
    try {
      const res = await api.get(`/content/${id}`);
      setSeries(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load series");
    }
  }

  async function fetchEpisodes() {
    try {
      const res = await api.get(`/episodes/${id}`);
      setEpisodes(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchReviews() {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchDiscussions() {
    try {
      const res = await api.get(`/discussions/${id}`);
      setDiscussions(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function addToWatchlist(status) {
    try {
      await api.post("/watchlist", {
        content_id: Number(id),
        status,
      });

      toast.success(
        status === "watched" ? "Marked as watched" : "Added to watchlist"
      );
    } catch (error) {
      console.log(error);
      toast.error("You must be logged in");
    }
  }

  async function saveRating(rate) {
    try {
      await api.post("/ratings", {
        content_id: Number(id),
        rating: rate,
      });

      toast.success(`You rated ${rate}/10`);
    } catch (error) {
      console.log(error);
      toast.error("Rating failed");
    }
  }

  async function addToTopList() {
    try {
      await api.post("/top-lists", {
        content_id: Number(id),
        list_type: "top_series",
        position: 1,
      });

      toast.success("Added to Top Series");
    } catch (error) {
      console.log(error);
      toast.error("Failed to add to top list");
    }
  }

  async function submitReview() {
    if (!reviewText.trim()) return;

    try {
      await api.post("/reviews", {
        content_id: Number(id),
        review_text: reviewText,
      });

      toast.success("Review posted");
      setReviewText("");
      fetchReviews();
    } catch (error) {
      console.log(error);
      toast.error("Failed to post review");
    }
  }

  async function submitDiscussion() {
    if (!discussionTitle.trim() || !discussionBody.trim()) return;

    try {
      await api.post("/discussions", {
        content_id: Number(id),
        title: discussionTitle,
        body: discussionBody,
      });

      toast.success("Discussion created");
      setDiscussionTitle("");
      setDiscussionBody("");
      fetchDiscussions();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create discussion");
    }
  }

  async function saveEpisode(episodeNumber, isFavorite = false) {
    const commentKey = `${activeSeason}-${episodeNumber}`;

    try {
      await api.post("/episodes", {
        content_id: Number(id),
        season_number: activeSeason,
        episode_number: episodeNumber,
        title: `Episode ${episodeNumber}`,
        is_favorite: isFavorite,
        comment: episodeComments[commentKey] || "",
      });

      toast.success("Episode saved");
      setEpisodeComments((current) => ({
        ...current,
        [commentKey]: "",
      }));
      fetchEpisodes();
    } catch (error) {
      console.log(error);
      toast.error("Failed to save episode");
    }
  }

  function getSavedEpisode(episodeNumber) {
    return episodes.find(
      (episode) =>
        episode.season_number === activeSeason &&
        episode.episode_number === episodeNumber
    );
  }

  if (!series) {
    return (
      <main>
        <AmbientBackground />

        <section className="container page">
          <div className="empty-state">
            <h2>Loading series...</h2>
          </div>
        </section>
      </main>
    );
  }

  const genres = series.genre ? series.genre.split(",") : [];

  return (
    <main className="details-page">
      <AmbientBackground />

      <section
        className="details-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(11,11,22,.96), rgba(11,11,22,.78), rgba(11,11,22,.55)), url(${series.backdrop_url})`,
        }}
      >
        <motion.div
          className="container details-content"
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.img
            className="details-poster"
            src={series.poster_url}
            alt={series.title}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />

          <div className="details-info">
            <span className="eyebrow">Series details</span>

            <h1>{series.title}</h1>

            <div className="details-meta">
              <span>{series.release_year}</span>
              <span>⭐ {series.rating}</span>
              <span>Series</span>
            </div>

            <div className="genre-list">
              {genres.map((genre) => (
                <span key={genre}>{genre.trim()}</span>
              ))}
            </div>

            <p className="details-description">{series.description}</p>

            <div className="details-actions">
              <button onClick={() => addToWatchlist("watchlist")}>
                + Watchlist
              </button>

              <button
                className="secondary-btn"
                onClick={() => addToWatchlist("watched")}
              >
                ✓ Watched
              </button>

              <button
                className="secondary-btn"
                onClick={addToTopList}
              >
                ★ Top Series
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <nav className="movie-subnav">
        <div className="container movie-subnav-content">
          {["overview", "episodes", "discussions", "reviews"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active-movie-tab" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <section className="container details-layout">
        <div className="details-main">
          {activeTab === "overview" && (
            <>
              <div className="details-panel">
                <h2>Overview</h2>

                <p className="details-description">{series.description}</p>

                <div className="main-feature-grid">
                  <div>
                    <strong>Status</strong>
                    <span>Returning / Released</span>
                  </div>

                  <div>
                    <strong>First Air Year</strong>
                    <span>{series.release_year}</span>
                  </div>

                  <div>
                    <strong>Rating</strong>
                    <span>{series.rating}</span>
                  </div>

                  <div>
                    <strong>Type</strong>
                    <span>Series</span>
                  </div>
                </div>
              </div>

              <div className="details-panel">
                <h2>Your Rating</h2>

                <div className="rating-buttons">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rate) => (
                    <button
                      key={rate}
                      className="rating-pill"
                      onClick={() => saveRating(rate)}
                    >
                      {rate}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "episodes" && (
            <div className="details-panel">
              <h2>Episode Management</h2>

              <div className="season-tabs">
                {seasons.map((season) => (
                  <button
                    key={season}
                    className={activeSeason === season ? "active-season" : ""}
                    onClick={() => setActiveSeason(season)}
                  >
                    Season {season}
                  </button>
                ))}
              </div>

              <div className="episodes-list">
                {[1, 2, 3, 4, 5].map((episodeNumber) => {
                  const savedEpisode = getSavedEpisode(episodeNumber);

                  return (
                    <div className="episode-card" key={episodeNumber}>
                      <div>
                        <span>
                          Season {activeSeason} • Episode {episodeNumber}
                        </span>

                        <h3>
                          {savedEpisode?.title || `Episode ${episodeNumber}`}
                        </h3>

                        {savedEpisode?.comment && (
                          <p className="episode-comment">
                            {savedEpisode.comment}
                          </p>
                        )}
                      </div>

                      <div className="episode-actions">
                        <button onClick={() => saveEpisode(episodeNumber)}>
                          ✓ Save Episode
                        </button>

                        <button
                          onClick={() => saveEpisode(episodeNumber, true)}
                        >
                          ★ Favorite
                        </button>
                      </div>

                      <textarea
                        placeholder="Add comment for this episode..."
                        value={
                          episodeComments[
                            `${activeSeason}-${episodeNumber}`
                          ] || ""
                        }
                        onChange={(event) => {
                          const commentKey = `${activeSeason}-${episodeNumber}`;

                          setEpisodeComments((current) => ({
                            ...current,
                            [commentKey]: event.target.value,
                          }));
                        }}
                      ></textarea>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "discussions" && (
            <div className="details-panel">
              <h2>Discussions</h2>

              <div className="discussion-form">
                <input
                  type="text"
                  placeholder="Discussion title..."
                  value={discussionTitle}
                  onChange={(event) => setDiscussionTitle(event.target.value)}
                />
                <textarea
                  placeholder="Start a discussion about this series..."
                  value={discussionBody}
                  onChange={(event) => setDiscussionBody(event.target.value)}
                ></textarea>
                <button onClick={submitDiscussion}>
                  Post Discussion
                </button>
              </div>

              <div className="discussion-list">
                {discussions.map((discussion) => (
                  <div className="discussion-card" key={discussion.id}>
                    <h3>{discussion.title}</h3>
                    <p>{discussion.body}</p>
                    <span>Posted by {discussion.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="details-panel">
              <h2>Reviews</h2>

              <textarea
                className="note-textarea"
                placeholder="Write your review about this series..."
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
              ></textarea>

              <button
                className="save-note-btn"
                onClick={submitReview}
              >
                Save Review
              </button>

              {reviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-top">
                    <strong>{review.username}</strong>
                  </div>

                  <p>{review.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="details-sidebar">
          <div className="sidebar-card">
            <h3>Series Facts</h3>

            <p>
              <strong>Year:</strong> {series.release_year}
            </p>

            <p>
              <strong>Rating:</strong> {series.rating}
            </p>

            <p>
              <strong>Type:</strong> Series
            </p>
          </div>

          <div className="sidebar-card">
            <h3>Genres</h3>

            <div className="keyword-list">
              {genres.map((genre) => (
                <span key={genre}>{genre.trim()}</span>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Saved Episodes</h3>

            <p>
              <strong>{episodes.length}</strong> saved/favorite episodes
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default SeriesDetails;
