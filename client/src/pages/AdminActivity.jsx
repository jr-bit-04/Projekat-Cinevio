import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

const activityLabels = {
  watchlist: "Watchlist",
  rating: "Rating",
  review: "Review",
  discussion: "Discussion",
};

function describeActivity(activity) {
  switch (activity.activity_type) {
    case "watchlist":
      return activity.detail === "watched"
        ? "marked as watched"
        : "added to watchlist";
    case "rating":
      return `rated ${activity.detail}/10`;
    case "review":
      return `wrote a review: "${activity.detail}"`;
    case "discussion":
      return `started a discussion: "${activity.detail}"`;
    default:
      return "did something";
  }
}

function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchActivity();
  }, []);

  async function fetchActivity() {
    try {
      const res = await api.get("/activity", { params: { limit: 150 } });
      setActivities(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load activity");
    }
  }

  const visibleActivities =
    filter === "all"
      ? activities
      : activities.filter((item) => item.activity_type === filter);

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">Admin activity</span>

          <h1>User Activity</h1>

          <p>See what users do across Cinevio — watchlists, ratings, reviews and discussions.</p>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <h3>{activities.filter((a) => a.activity_type === "watchlist").length}</h3>
            <p>Watchlist actions</p>
          </div>

          <div className="admin-stat-card">
            <h3>{activities.filter((a) => a.activity_type === "rating").length}</h3>
            <p>Ratings</p>
          </div>

          <div className="admin-stat-card">
            <h3>{activities.filter((a) => a.activity_type === "review").length}</h3>
            <p>Reviews</p>
          </div>

          <div className="admin-stat-card">
            <h3>{activities.filter((a) => a.activity_type === "discussion").length}</h3>
            <p>Discussions</p>
          </div>
        </div>

        <div className="admin-panel">
          <div className="activity-filter-bar">
            {["all", "watchlist", "rating", "review", "discussion"].map((key) => (
              <button
                key={key}
                className={filter === key ? "rating-pill active-rating" : "rating-pill"}
                onClick={() => setFilter(key)}
              >
                {key === "all" ? "All" : activityLabels[key]}
              </button>
            ))}
          </div>

          {visibleActivities.length === 0 ? (
            <div className="request-empty">
              <h3>No activity yet</h3>
              <p>User actions will appear here as they use Cinevio.</p>
            </div>
          ) : (
            <div className="activity-feed">
              {visibleActivities.map((activity) => (
                <div
                  className="activity-item"
                  key={`${activity.activity_type}-${activity.source_id}`}
                >
                  <span className={`status-pill status-${activity.activity_type}`}>
                    {activityLabels[activity.activity_type]}
                  </span>

                  <div className="activity-body">
                    <p>
                      <strong>
                        {activity.username || activity.email || "Unknown user"}
                      </strong>{" "}
                      {describeActivity(activity)}{" "}
                      {activity.content_title && activity.content_id && (
                        <Link
                          className="activity-content-link"
                          to={
                            activity.content_type === "series"
                              ? `/series-details/${activity.content_id}`
                              : `/details/${activity.content_id}`
                          }
                        >
                          — {activity.content_title}
                        </Link>
                      )}
                    </p>

                    <span className="activity-time">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default AdminActivity;
