import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function MovieCard({ movie }) {
  const detailsPath =
  movie.type === "Series"
    ? `/series-details/${movie.id}`
    : `/details/${movie.id}`;

  return (
    <Link to={detailsPath} className="movie-link">
      <motion.div
        className="movie-card"
        whileHover={{
          y: -14,
          scale: 1.035,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 18,
        }}
      >
        <div className="movie-poster-wrap">
          <img src={movie.image} alt={movie.title} />

          <div className="movie-card-badge">⭐ {movie.rating}</div>
        </div>

        <div className="movie-card-content">
          <span>{movie.type}</span>
          <h3>{movie.title}</h3>
          <p>{movie.year}</p>
        </div>
      </motion.div>
    </Link>
  );
}

export default MovieCard;