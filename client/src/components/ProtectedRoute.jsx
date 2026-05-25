import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return null;
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
