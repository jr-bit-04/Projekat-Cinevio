import { useEffect, useState } from "react";

import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  async function fetchProfile() {
    try {
      const res = await api.get("/users/profile");
      setProfile(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordBusy(true);

    try {
      const res = await api.put("/users/password", {
        currentPassword,
        newPassword,
      });

      setPasswordMessage(res.data.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Could not update password."
      );
    } finally {
      setPasswordBusy(false);
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

          <div className="profile-panel">
            <h2>Change Password</h2>

            <form className="password-form" onSubmit={handleChangePassword}>
              <label>
                <span>Current password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Enter current password"
                />
              </label>

              <label>
                <span>New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 6 characters"
                />
              </label>

              <label>
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat new password"
                />
              </label>

              {passwordError && (
                <p className="form-error">{passwordError}</p>
              )}

              {passwordMessage && (
                <p className="form-success">{passwordMessage}</p>
              )}

              <button type="submit" disabled={passwordBusy}>
                {passwordBusy ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Profile;
