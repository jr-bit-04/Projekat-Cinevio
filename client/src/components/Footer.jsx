import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div>
          <Link to="/" className="footer-logo">
            Cinevio
          </Link>

          <p>
            Your personal cinematic universe for movies, series, reviews,
            watchlists and recommendations.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/movies">Movies</Link>
          <Link to="/series">Series</Link>
          <Link to="/watchlist">Watchlist</Link>
          <Link to="/recommendations">Recommendations</Link>
        </div>

        <div className="footer-copy">
          © 2026 Cinevio. Built for movie lovers.
        </div>
      </div>
    </footer>
  );
}

export default Footer;