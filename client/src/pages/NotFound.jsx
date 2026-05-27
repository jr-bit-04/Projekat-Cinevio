import { Link } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground";

function NotFound() {
  return (
    <main className="not-found-page">
      <AmbientBackground />

      <div className="not-found-content">
        <span>404</span>

        <h1>Page not found.</h1>

        <p>
          Looks like this scene was deleted from the movie.
        </p>

        <Link to="/">
          <button>Back Home</button>
        </Link>
      </div>
    </main>
  );
}

export default NotFound;