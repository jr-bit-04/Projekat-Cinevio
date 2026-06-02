import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import api from "../services/api";
import AmbientBackground from "../components/AmbientBackground";
import { useAuth } from "../context/auth";

function SeriesDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [series, setSeries] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [topListId, setTopListId] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [tmdbDetails, setTmdbDetails] = useState({
    cast: [],
    seasons: [],
    awards: [],
    awardsMessage: "",
    trailer_url: "",
  });
  const [seasonDetails, setSeasonDetails] = useState({
    episodes: [],
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSeason, setActiveSeason] = useState(1);

  const [episodeComments, setEpisodeComments] = useState({});
  const [editingEpisodeId, setEditingEpisodeId] = useState(null);
  const [editingEpisodeComment, setEditingEpisodeComment] = useState("");
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

  useEffect(() => {
    fetchSeries();
    fetchTmdbDetails();
    fetchUserRating();
    fetchSavedEpisodes();
    fetchReviews();
    fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchSeasonDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeSeason]);

  async function fetchSeries() {
    try {
      const res = await api.get(`/content/${id}`);
      setSeries(res.data);
      fetchUserContentState(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load series");
    }
  }

  async function fetchTmdbDetails() {
    try {
      const res = await api.get(`/tmdb/series/${id}/details`);
      setTmdbDetails(res.data);

      if (res.data.seasons?.length > 0) {
        setActiveSeason(res.data.seasons[0].season_number);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchSeasonDetails() {
    try {
      const res = await api.get(
        `/tmdb/series/${id}/seasons/${activeSeason}`
      );
      setSeasonDetails(res.data);
    } catch (error) {
      console.log(error);
      setSeasonDetails({ episodes: [] });
    }
  }

  async function fetchSavedEpisodes() {
    if (!localStorage.getItem("token")) {
      return;
    }

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
      const [watchlistRes, topListRes] = await Promise.all([
        api.get("/watchlist"),
        api.get("/top-lists/top_series"),
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
        content_id: Number(id),
        status,
      });

      setWatchlistStatus(status);
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

      setUserRating(rate);
      toast.success(`You rated ${rate}/10`);
    } catch (error) {
      console.log(error);
      toast.error("Rating failed");
    }
  }

  async function deleteRating() {
    try {
      await api.delete(`/ratings/${id}`);
      setUserRating(null);
      toast.success("Rating removed");
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove rating");
    }
  }

  async function addToTopList() {
    try {
      const res = await api.post("/top-lists", {
        content_id: Number(id),
        list_type: "top_series",
        position: 1,
      });

      setTopListId(res.data.item.id);
      toast.success("Added to Top Series");
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
        content_id: Number(id),
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
    const confirmed = window.confirm("Delete this note?");

    if (!confirmed) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success("Note deleted");
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

  async function saveEpisode(episodeNumber, isFavorite = false, title = "") {
    const commentKey = `${activeSeason}-${episodeNumber}`;

    try {
      await api.post("/episodes", {
        content_id: Number(id),
        season_number: activeSeason,
        episode_number: episodeNumber,
        title: title || `Episode ${episodeNumber}`,
        is_favorite: isFavorite,
        comment: episodeComments[commentKey] || "",
      });

      toast.success("Episode saved");
      setEpisodeComments((current) => ({
        ...current,
        [commentKey]: "",
      }));
      fetchSavedEpisodes();
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

  function startEditingFavorite(episode) {
    setEditingEpisodeId(episode.id);
    setEditingEpisodeComment(episode.comment || "");
  }

  function cancelEditingFavorite() {
    setEditingEpisodeId(null);
    setEditingEpisodeComment("");
  }

  async function saveFavoriteEdit(episode) {
    try {
      await api.post("/episodes", {
        content_id: Number(id),
        season_number: episode.season_number,
        episode_number: episode.episode_number,
        title: episode.title,
        is_favorite: true,
        comment: editingEpisodeComment,
      });

      toast.success("Favorite episode updated");
      cancelEditingFavorite();
      fetchSavedEpisodes();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update favorite episode");
    }
  }

  async function deleteFavoriteEpisode(episodeId) {
    try {
      await api.delete(`/episodes/${episodeId}`);
      toast.success("Favorite episode deleted");
      fetchSavedEpisodes();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete favorite episode");
    }
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
  const seasons = tmdbDetails.seasons || [];
  const currentSeason = seasons.find(
    (season) => season.season_number === activeSeason
  );
  const displayEpisodes = seasonDetails.episodes || [];
  const favoriteEpisodes = episodes.filter(
    (episode) => episode.is_favorite
  );
  const tabs = [
    "overview",
    "episodes",
    "favorites",
    "cast",
    "awards",
    "media",
    "discussions",
    "notes",
  ];

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
        </motion.div>
      </section>

      <nav className="movie-subnav">
        <div className="container movie-subnav-content">
          {tabs.map((tab) => (
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
                    <span>{tmdbDetails.status || "Unknown"}</span>
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
                    <strong>Episodes</strong>
                    <span>
                      {tmdbDetails.number_of_episodes ||
                        displayEpisodes.length ||
                        "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="details-panel">
                <h2>Your Rating</h2>

                <div className="rating-buttons">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rate) => (
                    <button
                      key={rate}
                      className={
                        userRating === rate
                          ? "rating-pill active-rating"
                          : "rating-pill"
                      }
                      onClick={() => saveRating(rate)}
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

          {activeTab === "episodes" && (
            <div className="details-panel">
              <h2>{currentSeason?.name || `Season ${activeSeason}`}</h2>

              <div className="season-tabs">
                {seasons.map((season) => (
                  <button
                    key={season.id || season.season_number}
                    className={
                      activeSeason === season.season_number
                        ? "active-season"
                        : ""
                    }
                    onClick={() => setActiveSeason(season.season_number)}
                  >
                    Season {season.season_number}
                  </button>
                ))}
              </div>

              {displayEpisodes.length === 0 ? (
                <div className="empty-state">
                  <h2>No episodes found</h2>
                  <p>TMDB episode data is not available for this season.</p>
                </div>
              ) : (
              <div className="episodes-list">
                {displayEpisodes.map((episode) => {
                  const episodeNumber = episode.episode_number;
                  const savedEpisode = getSavedEpisode(
                    episodeNumber
                  );
                  const episodeTitle =
                    savedEpisode?.title ||
                    episode.title ||
                    `Episode ${episode.episode_number}`;

                  return (
                    <div
                      className="episode-card"
                      key={episode.id || episode.episode_number}
                    >
                      <div>
                        <span>
                          Season {activeSeason} • Episode {episodeNumber}
                        </span>

                        <h3>
                          {episodeTitle}
                        </h3>

                        {episode.air_date && (
                          <p className="episode-comment">
                            Air date: {episode.air_date}
                          </p>
                        )}

                        {episode.overview && (
                          <p className="details-description">
                            {episode.overview}
                          </p>
                        )}

                        {savedEpisode?.comment && (
                          <p className="episode-comment">
                            {savedEpisode.comment}
                          </p>
                        )}
                      </div>

                      <div className="episode-actions">
                        <button
                          onClick={() =>
                            saveEpisode(
                              episode.episode_number,
                              true,
                              episodeTitle
                            )
                          }
                        >
                          Save as Favorite
                        </button>
                      </div>

                      <textarea
                        placeholder="Add comment for this episode..."
                        value={
                          episodeComments[
                            `${activeSeason}-${episode.episode_number}`
                          ] || ""
                        }
                        onChange={(event) => {
                          const commentKey = `${activeSeason}-${episode.episode_number}`;

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
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="details-panel">
              <h2>Favorite Episodes</h2>

              {favoriteEpisodes.length === 0 ? (
                <div className="empty-state">
                  <h2>No favorite episodes yet</h2>
                  <p>
                    Mark episodes as favorite and add a comment to build your
                    personal list for this series.
                  </p>
                </div>
              ) : (
                <div className="episodes-list">
                  {favoriteEpisodes.map((episode) => (
                    <div className="episode-card" key={episode.id}>
                      <span>
                        {series.title} - Season {episode.season_number},
                        Episode {episode.episode_number}
                      </span>

                      <h3>{episode.title}</h3>

                      {editingEpisodeId === episode.id ? (
                        <>
                          <textarea
                            placeholder="Edit your comment..."
                            value={editingEpisodeComment}
                            onChange={(event) =>
                              setEditingEpisodeComment(event.target.value)
                            }
                          ></textarea>

                          <div className="episode-actions">
                            <button
                              onClick={() => saveFavoriteEdit(episode)}
                            >
                              Save Changes
                            </button>

                            <button onClick={cancelEditingFavorite}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {episode.comment ? (
                            <p className="episode-comment">
                              {episode.comment}
                            </p>
                          ) : (
                            <p className="episode-comment">
                              No comment saved for this favorite episode.
                            </p>
                          )}

                          <div className="episode-actions">
                            <button
                              onClick={() => startEditingFavorite(episode)}
                            >
                              Edit Comment
                            </button>

                            <button
                              onClick={() =>
                                deleteFavoriteEpisode(episode.id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "cast" && (
            <div className="details-panel">
              <h2>Cast</h2>

              {tmdbDetails.cast.length === 0 ? (
                <div className="empty-state">
                  <h2>No cast found</h2>
                  <p>TMDB cast data is not available for this series.</p>
                </div>
              ) : (
                <div className="cast-grid">
                  {tmdbDetails.cast.map((person) => (
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

              <div className="empty-state">
                <h2>No awards found</h2>
                <p>
                  {tmdbDetails.awardsMessage ||
                    "Awards are not available for this series."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="details-panel">
              <h2>Media</h2>

              {tmdbDetails.trailer_url ? (
                <div className="trailer-box">
                  <iframe
                    src={tmdbDetails.trailer_url}
                    title={`${series.title} trailer`}
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="empty-state">
                  <h2>No trailer found</h2>
                  <p>TMDB media data is not available for this series.</p>
                </div>
              )}
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
                {discussions.length === 0 ? (
                  <div className="discussion-empty">
                    <h3>No discussions yet</h3>
                    <p>Start the first conversation about this series.</p>
                  </div>
                ) : (
                  discussions.map((discussion) => {
                    const canManageDiscussion =
                      Number(user?.id) === Number(discussion.user_id) ||
                      user?.role === "admin";
                    const isEditing =
                      editingDiscussionId === discussion.id;

                    return (
                      <div className="discussion-card" key={discussion.id}>
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
                                <span>Posted by {discussion.username}</span>
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

          {activeTab === "notes" && (
            <div className="details-panel">
              <h2>Notes</h2>

              <textarea
                className="note-textarea"
                placeholder="Write your note about this series..."
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
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
                    <p>Share your opinion about this series.</p>
                  </div>
                ) : (
                  reviews.map((review) => {
                    const canManageReview =
                      Number(user?.id) === Number(review.user_id) ||
                      user?.role === "admin";
                    const isEditing = editingReviewId === review.id;

                    return (
                      <div className="review-card" key={review.id}>
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

            <p>
              <strong>Seasons:</strong>{" "}
              {tmdbDetails.number_of_seasons || seasons.length || "Unknown"}
            </p>

            <p>
              <strong>Episodes:</strong>{" "}
              {tmdbDetails.number_of_episodes || "Unknown"}
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
            <h3>Favorite Episodes</h3>

            <p>
              <strong>{favoriteEpisodes.length}</strong> favorite episodes
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default SeriesDetails;

