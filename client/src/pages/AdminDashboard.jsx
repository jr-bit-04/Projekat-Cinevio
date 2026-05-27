import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function AdminDashboard() {
  const [content, setContent] = useState([]);
  const [contentRequests, setContentRequests] = useState([]);
  const [posterFile, setPosterFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "movie",
    description: "",
    release_year: "",
    genre: "",
    rating: "",
    poster_url: "",
    backdrop_url: "",
    trailer_url: "",
  });

  useEffect(() => {
    fetchContent();
    fetchContentRequests();
  }, []);

  async function fetchContent() {
    try {
      const res = await api.get("/content");
      setContent(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchContentRequests() {
    try {
      const res = await api.get("/content-requests");
      setContentRequests(res.data);
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

  function resetForm() {
    setFormData({
      title: "",
      type: "movie",
      description: "",
      release_year: "",
      genre: "",
      rating: "",
      poster_url: "",
      backdrop_url: "",
      trailer_url: "",
    });

    setPosterFile(null);
    setEditingId(null);
  }

  function handleEdit(item) {
    setEditingId(item.id);

    setFormData({
      title: item.title || "",
      type: item.type || "movie",
      description: item.description || "",
      release_year: item.release_year || "",
      genre: item.genre || "",
      rating: item.rating || "",
      poster_url: item.poster_url || "",
      backdrop_url: item.backdrop_url || "",
      trailer_url: item.trailer_url || "",
    });
  }

  function handleUseRequest(request) {
    setEditingId(null);
    setPosterFile(null);

    setFormData({
      title: request.title || "",
      type: request.type || "movie",
      description: request.description || "",
      release_year: request.release_year || "",
      genre: request.genre || "",
      rating: request.rating || "",
      poster_url: request.poster_url || "",
      backdrop_url: request.backdrop_url || "",
      trailer_url: request.trailer_url || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleReviewRequest(id, status) {
    const label = status === "approved" ? "approve" : "reject";
    const confirmed = window.confirm(`Do you want to ${label} this request?`);

    if (!confirmed) return;

    try {
      await api.patch(`/content-requests/${id}/review`, { status });
      toast.success(
        status === "approved"
          ? "Request approved and content added"
          : "Request rejected"
      );
      fetchContent();
      fetchContentRequests();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Review failed");
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm("Delete this content?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/content/${id}`);
      toast.success("Content deleted");
      fetchContent();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      let uploadedPosterUrl = formData.poster_url;

      if (posterFile) {
        const uploadData = new FormData();
        uploadData.append("image", posterFile);

        const uploadRes = await api.post("/upload/image", uploadData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        uploadedPosterUrl = uploadRes.data.imageUrl;
      }

      const payload = {
        ...formData,
        release_year: Number(formData.release_year),
        rating: Number(formData.rating),
        poster_url: uploadedPosterUrl,
      };

      if (editingId) {
        await api.put(`/content/${editingId}`, payload);
        toast.success("Content updated");
      } else {
        await api.post("/content", payload);
        toast.success("Content added");
      }

      resetForm();
      fetchContent();
    } catch (error) {
      console.log(error);
      toast.error("Action failed");
    }
  }

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">Admin panel</span>

          <h1>Cinevio Dashboard</h1>

          <p>Manage movies, series, users, uploaded posters and platform content.</p>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <h3>{content.filter((item) => item.type === "movie").length}</h3>
            <p>Total Movies</p>
          </div>

          <div className="admin-stat-card">
            <h3>{content.filter((item) => item.type === "series").length}</h3>
            <p>Total Series</p>
          </div>

          <div className="admin-stat-card">
            <h3>{content.length}</h3>
            <p>Total Content</p>
          </div>

          <div className="admin-stat-card">
            <h3>
              {
                contentRequests.filter((request) => request.status === "pending")
                  .length
              }
            </h3>
            <p>Pending Requests</p>
          </div>
        </div>

        <div className="admin-layout">
          <div className="admin-panel">
            <h2>{editingId ? "Edit Content" : "Add New Content"}</h2>

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
                  placeholder="Poster URL or upload below"
                  value={formData.poster_url}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Upload Poster</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setPosterFile(event.target.files[0])}
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

              <button type="submit" className="admin-submit">
                {editingId ? "Update Content" : "Add Content"}
              </button>

              {editingId && (
                <button type="button" className="clear-filters" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="admin-panel content-list-panel">
            <h2>Content List</h2>

            <div className="admin-table">
              <div className="admin-table-row admin-table-head">
                <span>Title</span>
                <span>Type</span>
                <span>Actions</span>
              </div>

              {content.map((item) => (
                <div className="admin-table-row" key={item.id}>
                  <span>{item.title}</span>
                  <span>{item.type}</span>

                  <span className="admin-actions">
                    <button onClick={() => handleEdit(item)}>Edit</button>
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-panel request-admin-panel">
          <h2>User Requests</h2>

          {contentRequests.length === 0 ? (
            <div className="request-empty">
              <h3>No requests yet</h3>
              <p>User suggestions will appear here.</p>
            </div>
          ) : (
            <div className="request-list">
              {contentRequests.map((request) => (
                <div className="request-card" key={request.id}>
                  <div className="request-card-top">
                    <div>
                      <h3>{request.title}</h3>
                      <p>
                        {request.type} • {request.release_year} • {request.genre}
                      </p>
                      <p>
                        Requested by{" "}
                        {request.requested_by_username ||
                          request.requested_by_email ||
                          "Unknown user"}
                      </p>
                    </div>

                    <span className={`status-pill status-${request.status}`}>
                      {request.status}
                    </span>
                  </div>

                  <p className="request-description">{request.description}</p>

                  <div className="request-actions">
                    <button onClick={() => handleUseRequest(request)}>
                      Use as Draft
                    </button>

                    <button
                      disabled={request.status !== "pending"}
                      onClick={() => handleReviewRequest(request.id, "approved")}
                    >
                      Approve
                    </button>

                    <button
                      disabled={request.status !== "pending"}
                      onClick={() => handleReviewRequest(request.id, "rejected")}
                    >
                      Reject
                    </button>
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

export default AdminDashboard;
