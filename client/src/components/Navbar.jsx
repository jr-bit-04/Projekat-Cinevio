import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";


function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const displayName = user?.username || user?.name || user?.email || "User";
  const userInitial = displayName.trim().charAt(0).toUpperCase() || "U";
  const userRole = user?.role || "regular";

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          Cinevio
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <div className={menuOpen ? "nav-links nav-open" : "nav-links"}>
          <Link to="/movies">Movies</Link>
          <Link to="/series">Series</Link>
          <Link to="/watchlist">Watchlist</Link>
          <Link to="/top-movies">Top Movies</Link>
          <Link to="/top-series">Top Series</Link>
          <Link to="/recommendations">Recommendations</Link>
          {userRole !== "admin" && (
            <Link to="/request-content">Request Content</Link>
          )}
        </div>

        <div className="nav-auth">
          {!user ? (
            <>
              <Link to="/login">Login</Link>

              <Link to="/register">
                <button>Register</button>
              </Link>
            </>
          ) : (
            <div className="user-menu">
              <button
                className="user-avatar-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {userInitial}
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <strong>{displayName}</strong>
                  <span>{userRole}</span>

                  <Link to="/profile">Profile</Link>
                  <Link to="/watchlist">Watchlist</Link>
                  {userRole !== "admin" && (
                    <Link to="/request-content">Request Content</Link>
                  )}

                  {userRole === "admin" && (
                    <>
                      <Link to="/admin">Admin Panel</Link>
                      <Link to="/admin/users">Users</Link>
                      <Link to="/admin/activity">Activity</Link>
                    </>
                  )}

                  <button onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
