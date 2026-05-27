import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AmbientBackground from "../components/AmbientBackground";
import { useAuth } from "../context/auth";
import api from "../services/api";

function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load users");
      }
    }

    loadUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load users");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this user?");

    if (!confirmed) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  }

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">Admin users</span>

          <h1>Users</h1>

          <p>View registered Cinevio accounts and remove users when needed.</p>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>

          <div className="admin-stat-card">
            <h3>{users.filter((item) => item.role === "admin").length}</h3>
            <p>Admins</p>
          </div>

          <div className="admin-stat-card">
            <h3>{users.filter((item) => item.role !== "admin").length}</h3>
            <p>Regular Users</p>
          </div>

          <div className="admin-stat-card">
            <h3>Admin</h3>
            <p>Current Role</p>
          </div>
        </div>

        <div className="admin-panel">
          <h2>All Users</h2>

          <div className="admin-table users-table">
            <div className="admin-table-row admin-table-head users-table-row">
              <span>Username</span>
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Actions</span>
            </div>

            {users.map((item) => (
              <div className="admin-table-row users-table-row" key={item.id}>
                <span>{item.username}</span>
                <span>{item.email}</span>
                <span className={`status-pill status-${item.role}`}>
                  {item.role}
                </span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>

                <span className="admin-actions">
                  <button
                    disabled={Number(item.id) === Number(user?.id)}
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminUsers;
