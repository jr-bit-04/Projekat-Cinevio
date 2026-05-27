import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";
import { useAuth } from "../context/auth";

const emptyForm = {
  title: "",
  type: "movie",
  description: "",
  release_year: "",
  genre: "",
  rating: "",
  poster_url: "",
  backdrop_url: "",
  trailer_url: "",
};

function ContentRequest() {
  const { user } = useAuth();
  const [formData, setFormData] = useState(emptyForm);
  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await api.get("/content-requests/mine");
      setRequests(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/content-requests", {
        ...formData,
        release_year: Number(formData.release_year),
        rating: Number(formData.rating),
      });

      toast.success("Request sent to admin");
      setFormData(emptyForm);
      fetchRequests();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin" />;
  }

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">Content request</span>

          <h1>Suggest a movie or series</h1>

          <p>
            Send a title to the admin team for review. Approved requests become
            part of the Cinevio library.
          </p>
        </div>

        <div className="request-layout">
          <div className="admin-panel">
            <h2>New Request</h2>

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  name="title"
                  type="text"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="movie">Movie</option>
                  <option value="series">Series</option>
                </select>
              </div>

              <div className="form-group">
                <label>Genre</label>
                <input
                  name="genre"
                  type="text"
                  placeholder="Sci-Fi, Drama..."
                  value={formData.genre}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Release Year</label>
                <input
                  name="release_year"
                  type="number"
                  placeholder="2014"
                  value={formData.release_year}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  placeholder="8.7"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Poster URL</label>
                <input
                  name="poster_url"
                  type="text"
                  placeholder="Poster image URL"
                  value={formData.poster_url}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Backdrop URL</label>
                <input
                  name="backdrop_url"
                  type="text"
                  placeholder="Backdrop image URL"
                  value={formData.backdrop_url}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Trailer URL</label>
                <input
                  name="trailer_url"
                  type="text"
                  placeholder="YouTube embed URL"
                  value={formData.trailer_url}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Write description..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="admin-submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </form>
          </div>

          <div className="admin-panel">
            <h2>My Requests</h2>

            {requests.length === 0 ? (
              <div className="request-empty">
                <h3>No requests yet</h3>
                <p>Your submitted titles will show up here.</p>
              </div>
            ) : (
              <div className="request-list">
                {requests.map((request) => (
                  <div className="request-card" key={request.id}>
                    <div className="request-card-top">
                      <div>
                        <h3>{request.title}</h3>
                        <p>
                          {request.type} • {request.release_year} •{" "}
                          {request.genre}
                        </p>
                      </div>

                      <span className={`status-pill status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>

                    {request.admin_note && (
                      <p className="request-note">{request.admin_note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContentRequest;
