import { useEffect, useState } from "react";

import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState(null);

  async function fetchProfile() {
    try {
      const res = await api.get("/users/profile");
      setProfile(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <main>
        <AmbientBackground />

        <section className="container page">
          <div className="empty-state">
            <h2>Loading profile...</h2>
          </div>
        </section>
      </main>
    );
  }

  const displayName = profile.username || profile.name || profile.email || "User";
  const profileInitial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="profile-hero-card">
          <div className="profile-avatar">
            {profileInitial}
          </div>

          <div>
            <span className="eyebrow">User profile</span>

            <h1>{displayName}</h1>

            <p>
              {profile.role === "admin" ? "Admin user" : "Regular user"} •
              Cinevio member
            </p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-panel">
            <h2>Account Info</h2>

            <div className="profile-info-row">
              <span>Username</span>
              <strong>{displayName}</strong>
            </div>

            <div className="profile-info-row">
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>

            <div className="profile-info-row">
              <span>Role</span>
              <strong>{profile.role}</strong>
            </div>
          </div>

          <div className="profile-panel">
            <h2>Membership</h2>

            <div className="profile-info-row">
              <span>User ID</span>
              <strong>#{profile.id}</strong>
            </div>

            <div className="profile-info-row">
              <span>Created At</span>
              <strong>
                {new Date(profile.created_at).toLocaleDateString()}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Status</span>
              <strong>Active</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Profile;
