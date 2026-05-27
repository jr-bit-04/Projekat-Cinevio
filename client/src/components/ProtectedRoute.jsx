import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import AmbientBackground from "./AmbientBackground";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return (
      <main>
        <AmbientBackground />

        <section className="container page">
          <div className="empty-state">
            <h2>Checking session...</h2>
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
