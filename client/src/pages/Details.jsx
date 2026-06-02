import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import api from "../services/api";
import AmbientBackground from "../components/AmbientBackground";
import { useAuth } from "../context/auth";

function Details() {
  const { id } = useParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("main");
  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [topListId, setTopListId] = useState(null);

  const [reviewText, setReviewText] = useState("");
  const [reviewIsPublic, setReviewIsPublic] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState("");
  const [editingReviewIsPublic, setEditingReviewIsPublic] = useState(true);
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionBody, setDiscussionBody] = useState("");
  const [editingDiscussionId, setEditingDiscussionId] = useState(null);
  const [editingDiscussionTitle, setEditingDiscussionTitle] = useState("");
  const [editingDiscussionBody, setEditingDiscussionBody] = useState("");

  const [reviews, setReviews] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [movieExtras, setMovieExtras] = useState({
    cast: [],
    videos: [],
    awards: [],
    awardsMessage: "",
    trailer_url: "",
  });

  const tabs = [
    "main",
    "cast",
    "awards",
    "media",
    "discussions",
    "notes",
  ];

  useEffect(() => {
    fetchMovie();
    fetchMovieExtras();
    fetchUserRating();
    fetchRatingStats();
    fetchReviews();
    fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchMovie() {
    try {
      const res = await api.get(`/content/${id}`);
      setMovie(res.data);
      fetchUserContentState(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load movie");
    }
  }

  async function fetchMovieExtras() {
    try {
      const res = await api.get(`/tmdb/movies/${id}/extras`);
      setMovieExtras(res.data);
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

  async function fetchUserRating() {
    if (!localStorage.getItem("token")) {
      setUserRating(null);
      return;
    }

    try {
      const res = await api.get(`/ratings/${id}`);
      setUserRating(res.data?.rating || null);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchUserContentState(contentItem) {
    if (!localStorage.getItem("token")) {
      setWatchlistStatus(null);
      setTopListId(null);
      return;
    }

    try {
      const listType =
        contentItem.type === "series" ? "top_series" : "top_movies";

      const [watchlistRes, topListRes] = await Promise.all([
        api.get("/watchlist"),
        api.get(`/top-lists/${listType}`),
      ]);

      const watchlistItem = watchlistRes.data.find(
        (item) => Number(item.id) === Number(contentItem.id)
      );
      const topListItem = topListRes.data.find(
        (item) => Number(item.id) === Number(contentItem.id)
      );

      setWatchlistStatus(watchlistItem?.status || null);
      setTopListId(topListItem?.top_id || null);
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
        content_id: movie.id,
        status,
      });

      setWatchlistStatus(status);
      toast.success(
        status === "watched"
          ? "Marked as watched"
          : "Added to watchlist"
      );
    } catch (error) {
      console.log(error);
      toast.error("You must be logged in");
    }
  }

  function scoreCircleStyle(percent) {
    const value = Math.max(0, Math.min(100, percent));
    return {
      background: `radial-gradient(circle, #10101f 54%, transparent 56%), conic-gradient(var(--purple) ${value}%, #2a2a44 0)`,
    };
  }

  async function fetchRatingStats() {
    try {
      const res = await api.get(`/ratings/stats/${id}`);
      setRatingStats(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function saveRating(rate) {
    try {
      await api.post("/ratings", {
        content_id: movie.id,
        rating: rate,
      });

      setUserRating(rate);
      toast.success(`You rated ${rate}/10`);
      fetchRatingStats();
    } catch (error) {
      console.log(error);
      toast.error("Rating failed");
    }
  }

  async function deleteRating() {
    try {
      await api.delete(`/ratings/${movie.id}`);
      setUserRating(null);
      toast.success("Rating removed");
      fetchRatingStats();
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove rating");
    }
  }

  async function addToTopList() {
  try {
    const listType = movie.type === "series" ? "top_series" : "top_movies";

    const res = await api.post("/top-lists", {
      content_id: movie.id,
      list_type: listType,
      position: 1,
    });

    setTopListId(res.data.item.id);
    toast.success(
      movie.type === "series"
        ? "Added to Top Series"
        : "Added to Top Movies"
    );
  } catch (error) {
    console.log(error);
    toast.error("Failed to add to top list");
  }
}

  async function removeFromTopList() {
    if (!topListId) return;

    try {
      await api.delete(`/top-lists/${topListId}`);
      setTopListId(null);
      toast.success("Removed from top list");
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove from top list");
    }
  }

  async function submitReview() {
    if (!reviewText.trim()) return;

    try {
      await api.post("/reviews", {
        content_id: movie.id,
        review_text: reviewText,
        is_public: reviewIsPublic,
      });

      toast.success("Note posted");

      setReviewText("");
      setReviewIsPublic(true);

      fetchReviews();
    } catch (error) {
      console.log(error);
      toast.error("Failed to post note");
    }
  }

  function startEditingReview(review) {
    setEditingReviewId(review.id);
    setEditingReviewText(review.review_text);
    setEditingReviewIsPublic(review.is_public);
  }

  function cancelEditingReview() {
    setEditingReviewId(null);
    setEditingReviewText("");
    setEditingReviewIsPublic(true);
  }

  async function updateReview(reviewId) {
    if (!editingReviewText.trim()) return;

    try {
      await api.put(`/reviews/${reviewId}`, {
        review_text: editingReviewText,
        is_public: editingReviewIsPublic,
      });

      toast.success("Note updated");
      cancelEditingReview();
      fetchReviews();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update note");
    }
  }

  async function deleteReview(reviewId) {
    const confirmed = window.confirm("Delete this review?");

    if (!confirmed) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted");
      fetchReviews();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete note");
    }
  }

  async function submitDiscussion() {
    if (!discussionTitle.trim() || !discussionBody.trim()) return;

    try {
      await api.post("/discussions", {
        content_id: movie.id,
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

  function startEditingDiscussion(discussion) {
    setEditingDiscussionId(discussion.id);
    setEditingDiscussionTitle(discussion.title);
    setEditingDiscussionBody(discussion.body);
  }

  function cancelEditingDiscussion() {
    setEditingDiscussionId(null);
    setEditingDiscussionTitle("");
    setEditingDiscussionBody("");
  }

  async function updateDiscussion(discussionId) {
    if (!editingDiscussionTitle.trim() || !editingDiscussionBody.trim()) return;

    try {
      await api.put(`/discussions/${discussionId}`, {
        title: editingDiscussionTitle,
        body: editingDiscussionBody,
      });

      toast.success("Discussion updated");
      cancelEditingDiscussion();
      fetchDiscussions();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update discussion");
    }
  }

  async function deleteDiscussion(discussionId) {
    const confirmed = window.confirm("Delete this discussion?");

    if (!confirmed) return;

    try {
      await api.delete(`/discussions/${discussionId}`);
      toast.success("Discussion deleted");
      fetchDiscussions();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete discussion");
    }
  }

  if (!movie) {
    return (
      <main>
        <AmbientBackground />

        <section className="container page">
          <div className="empty-state">
            <h2>Loading movie...</h2>
          </div>
        </section>
      </main>
    );
  }

  const genres = movie.genre ? movie.genre.split(",") : [];

  return (
    <main className="details-page">
      <AmbientBackground />

      <section
        className="details-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(11,11,22,.96), rgba(11,11,22,.78), rgba(11,11,22,.55)), url(${movie.backdrop_url})`,
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
            src={movie.poster_url}
            alt={movie.title}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />

          <div className="details-info">
            <span className="eyebrow">{movie.type} details</span>

            <h1>{movie.title}</h1>

            <div className="details-meta">
              <span>{movie.release_year}</span>
              <span>⭐ {movie.rating}</span>
              <span>{movie.type}</span>
            </div>

            <div className="genre-list">
              {genres.map((genre) => (
                <span key={genre}>{genre.trim()}</span>
              ))}
            </div>

            <p className="details-description">
              {movie.description}
            </p>

            <div className="score-actions-row">
              <div className="score-group">
                <div className="user-score">
                  <div
                    className="score-circle"
                    style={scoreCircleStyle(Math.round(movie.rating * 10))}
                  >
                    {Math.round(movie.rating * 10)}%
                  </div>

                  <p>TMDB Rating</p>
                </div>

                <div className="user-score">
                  <div
                    className={
                      ratingStats.count > 0
                        ? "score-circle"
                        : "score-circle score-circle-empty"
                    }
                    style={scoreCircleStyle(
                      ratingStats.count > 0
                        ? Math.round(ratingStats.average * 10)
                        : 0
                    )}
                  >
                    {ratingStats.count > 0
                      ? `${Math.round(ratingStats.average * 10)}%`
                      : "NR"}
                  </div>

                  <p>
                    Cinevio Score
                    <span>
                      {" "}
                      {ratingStats.count > 0
                        ? `(${ratingStats.count} ${
                            ratingStats.count === 1 ? "vote" : "votes"
                          })`
                        : "(no ratings yet)"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="details-actions">
                <button
                  className={
                    watchlistStatus === "watchlist"
                      ? "action-complete"
                      : ""
                  }
                  onClick={() => addToWatchlist("watchlist")}
                >
                  {watchlistStatus === "watchlist"
                    ? "✓ Watchlisted"
                    : "+ Watchlist"}
                </button>

                <button
                  className={
                    watchlistStatus === "watched"
                      ? "secondary-btn action-complete"
                      : "secondary-btn"
                  }
                  onClick={() => addToWatchlist("watched")}
                >
                  {watchlistStatus === "watched" ? "✓ Watched" : "Mark Watched"}
                </button>

                <button
                  className={
                    topListId
                      ? "secondary-btn action-complete"
                      : "secondary-btn"
                  }
                  onClick={addToTopList}
                >
                  {topListId ? "✓ In Top List" : "★ Top List"}
                </button>

                {topListId && (
                  <button
                    className="secondary-btn remove-toplist-btn"
                    onClick={removeFromTopList}
                  >
                    Remove Top List
                  </button>
                )}
              </div>                         
            </div>
          </div>
        </motion.div>
      </section>

      <nav className="movie-subnav">
        <div className="container movie-subnav-content">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={
                activeTab === tab
                  ? "active-movie-tab"
                  : ""
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() +
                tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <section className="container details-layout">
        <motion.div
          className="details-main"
          key={activeTab}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {activeTab === "main" && (
            <>
              <div className="details-panel">
                <h2>Overview</h2>

                <p className="details-description">
                  {movie.description}
                </p>
              </div>

              <div className="details-panel rating-panel">
                <h2>Your Rating</h2>

                <div className="rating-buttons">
                  {[1,2,3,4,5,6,7,8,9,10].map((rate) => (
                    <button
                      key={rate}
                      className={
                        userRating === rate
                          ? "rating-pill active-rating"
                          : "rating-pill"
                      }
                      onClick={() =>
                        saveRating(rate)
                      }
                    >
                      {rate}
                    </button>
                  ))}
                </div>

                {userRating && (
                  <button
                    className="remove-rating-btn"
                    onClick={deleteRating}
                  >
                    Remove rating
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === "cast" && (
            <div className="details-panel">
              <h2>Cast</h2>

              {movieExtras.cast.length === 0 ? (
                <div className="empty-state">
                  <h2>No cast found</h2>
                  <p>TMDB cast data is not available for this title.</p>
                </div>
              ) : (
                <div className="cast-grid">
                  {movieExtras.cast.map((person) => (
                    <div className="cast-card" key={person.id}>
                      {person.profile_url && (
                        <img src={person.profile_url} alt={person.name} />
                      )}

                      <h3>{person.name}</h3>
                      <p>{person.character || "Cast member"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "awards" && (
            <div className="details-panel">
              <h2>Awards</h2>

              {movieExtras.awards.length === 0 ? (
                <div className="empty-state">
                  <h2>No awards found</h2>
                  <p>
                    {movieExtras.awardsMessage ||
                      "Awards are not available for this title."}
                  </p>
                </div>
              ) : (
                <div className="awards-list">
                  {movieExtras.awards.map((award) => (
                    <div key={award.id || award.name}>
                      <strong>{award.name}</strong>
                      <p>{award.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "media" && (
            <div className="details-panel">
              <h2>Media</h2>

              {movieExtras.trailer_url ? (
                <div className="trailer-box">
                  <iframe
                    src={movieExtras.trailer_url}
                    title={`${movie.title} trailer`}
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="empty-state">
                  <h2>No trailer found</h2>
                  <p>TMDB media data is not available for this title.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="details-panel">
              <h2>Notes</h2>

              <textarea
                className="note-textarea"
                placeholder="Write your note..."
                value={reviewText}
                onChange={(e) =>
                  setReviewText(e.target.value)
                }
              ></textarea>

              <label className="privacy-toggle">
                <input
                  type="checkbox"
                  checked={reviewIsPublic}
                  onChange={(event) =>
                    setReviewIsPublic(event.target.checked)
                  }
                />
                <span>{reviewIsPublic ? "Public note" : "Private note"}</span>
              </label>

              <button
                className="save-note-btn"
                onClick={submitReview}
              >
                Save Note
              </button>

              <div className="review-list">
                {reviews.length === 0 ? (
                  <div className="discussion-empty">
                    <h3>No notes yet</h3>
                    <p>Share your opinion about this title.</p>
                  </div>
                ) : (
                  reviews.map((review) => {
                    const canManageReview =
                      Number(user?.id) === Number(review.user_id) ||
                      user?.role === "admin";
                    const isEditing = editingReviewId === review.id;

                    return (
                      <div
                        className="review-card"
                        key={review.id}
                      >
                        {isEditing ? (
                          <div className="review-edit-form">
                            <textarea
                              value={editingReviewText}
                              onChange={(event) =>
                                setEditingReviewText(event.target.value)
                              }
                            ></textarea>

                            <label className="privacy-toggle">
                              <input
                                type="checkbox"
                                checked={editingReviewIsPublic}
                                onChange={(event) =>
                                  setEditingReviewIsPublic(event.target.checked)
                                }
                              />
                              <span>
                                {editingReviewIsPublic
                                  ? "Public note"
                                  : "Private note"}
                              </span>
                            </label>

                            <div className="review-actions">
                              <button onClick={() => updateReview(review.id)}>
                                Save
                              </button>

                              <button
                                className="review-ghost-btn"
                                onClick={cancelEditingReview}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="review-card-top">
                              <div className="review-top">
                                <strong>{review.username}</strong>
                                <span
                                  className={
                                    review.is_public
                                      ? "review-badge public"
                                      : "review-badge private"
                                  }
                                >
                                  {review.is_public ? "Public" : "Private"}
                                </span>
                              </div>

                              {canManageReview && (
                                <div className="review-actions">
                                  <button
                                    className="review-ghost-btn"
                                    onClick={() => startEditingReview(review)}
                                  >
                                    Edit
                                  </button>

                                  <button
                                    className="review-danger-btn"
                                    onClick={() => deleteReview(review.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>

                            <p>{review.review_text}</p>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
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
                  onChange={(e) =>
                    setDiscussionTitle(
                      e.target.value
                    )
                  }
                />

                <textarea
                  placeholder="Start discussion..."
                  value={discussionBody}
                  onChange={(e) =>
                    setDiscussionBody(
                      e.target.value
                    )
                  }
                ></textarea>

                <button onClick={submitDiscussion}>
                  Post Discussion
                </button>
              </div>

              <div className="discussion-list">
                {discussions.length === 0 ? (
                  <div className="discussion-empty">
                    <h3>No discussions yet</h3>
                    <p>Start the first conversation about this title.</p>
                  </div>
                ) : (
                  discussions.map((discussion) => {
                    const canManageDiscussion =
                      Number(user?.id) === Number(discussion.user_id) ||
                      user?.role === "admin";
                    const isEditing =
                      editingDiscussionId === discussion.id;

                    return (
                      <div
                        className="discussion-card"
                        key={discussion.id}
                      >
                        {isEditing ? (
                          <div className="discussion-edit-form">
                            <input
                              type="text"
                              value={editingDiscussionTitle}
                              onChange={(event) =>
                                setEditingDiscussionTitle(event.target.value)
                              }
                            />

                            <textarea
                              value={editingDiscussionBody}
                              onChange={(event) =>
                                setEditingDiscussionBody(event.target.value)
                              }
                            ></textarea>

                            <div className="discussion-actions">
                              <button
                                onClick={() => updateDiscussion(discussion.id)}
                              >
                                Save
                              </button>

                              <button
                                className="discussion-ghost-btn"
                                onClick={cancelEditingDiscussion}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="discussion-card-top">
                              <div>
                                <h3>{discussion.title}</h3>

                                <span>
                                  Posted by {discussion.username}
                                </span>
                              </div>

                              {canManageDiscussion && (
                                <div className="discussion-actions">
                                  <button
                                    className="discussion-ghost-btn"
                                    onClick={() =>
                                      startEditingDiscussion(discussion)
                                    }
                                  >
                                    Edit
                                  </button>

                                  <button
                                    className="discussion-danger-btn"
                                    onClick={() =>
                                      deleteDiscussion(discussion.id)
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>

                            <p>{discussion.body}</p>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </motion.div>

        <aside className="details-sidebar">
          <div className="sidebar-card">
            <h3>Movie Facts</h3>

            <p>
              <strong>Year:</strong>{" "}
              {movie.release_year}
            </p>

            <p>
              <strong>Rating:</strong>{" "}
              {movie.rating}
            </p>

            <p>
              <strong>Type:</strong> {movie.type}
            </p>
          </div>

          <div className="sidebar-card">
            <h3>Genres</h3>

            <div className="keyword-list">
              {genres.map((genre) => (
                <span key={genre}>
                  {genre.trim()}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Details;
