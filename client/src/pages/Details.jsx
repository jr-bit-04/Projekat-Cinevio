import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import api from "../services/api";
import AmbientBackground from "../components/AmbientBackground";

function Details() {
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("main");
  const [movie, setMovie] = useState(null);

  const [reviewText, setReviewText] = useState("");
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionBody, setDiscussionBody] = useState("");

  const [reviews, setReviews] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  const tabs = [
    "main",
    "cast",
    "awards",
    "media",
    "discussions",
    "reviews",
  ];

  useEffect(() => {
    fetchMovie();
    fetchReviews();
    fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchMovie() {
    try {
      const res = await api.get(`/content/${id}`);
      setMovie(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load movie");
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
        content_id: movie.id,
        status,
      });

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

  async function saveRating(rate) {
    try {
      await api.post("/ratings", {
        content_id: movie.id,
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
    const listType = movie.type === "series" ? "top_series" : "top_movies";

    await api.post("/top-lists", {
      content_id: movie.id,
      list_type: listType,
      position: 1,
    });

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

  async function submitReview() {
    if (!reviewText.trim()) return;

    try {
      await api.post("/reviews", {
        content_id: movie.id,
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
    if (!discussionTitle || !discussionBody) return;

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
              <div className="user-score">
                <div className="score-circle">
                  {Math.round(movie.rating * 10)}%
                </div>

                <p>User Score</p>
              </div>
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

                <button className="secondary-btn" onClick={addToTopList}>
                  ★ {movie.type === "series" ? "Top Series" : "Top Movie"}
                </button>
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
                      className="rating-pill"
                      onClick={() =>
                        saveRating(rate)
                      }
                    >
                      {rate}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "reviews" && (
            <div className="details-panel">
              <h2>Reviews</h2>

              {reviews.map((review) => (
                <div
                  className="review-card"
                  key={review.id}
                >
                  <div className="review-top">
                    <strong>
                      {review.username}
                    </strong>
                  </div>

                  <p>{review.review_text}</p>
                </div>
              ))}

              <textarea
                className="note-textarea"
                placeholder="Write your review..."
                value={reviewText}
                onChange={(e) =>
                  setReviewText(e.target.value)
                }
              ></textarea>

              <button
                className="save-note-btn"
                onClick={submitReview}
              >
                Save Review
              </button>
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
                {discussions.map((discussion) => (
                  <div
                    className="discussion-card"
                    key={discussion.id}
                  >
                    <h3>{discussion.title}</h3>

                    <p>{discussion.body}</p>

                    <span>
                      Posted by{" "}
                      {discussion.username}
                    </span>
                  </div>
                ))}
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
