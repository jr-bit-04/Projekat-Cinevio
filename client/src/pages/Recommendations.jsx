import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";
import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function Recommendations() {
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  async function fetchRecommendations() {
    try {
      const res = await api.get("/recommendations");

      const mapped = res.data.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type === "series" ? "Series" : "Movie",
        year: String(item.release_year),
        rating: item.rating,
        genre: item.genre,
        image: item.poster_url,
      }));

      setRecommendedMovies(mapped);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecommendations();
  }, []);

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="recommendation-hero">
          <span className="eyebrow">Smart recommendations</span>

          <h1>Recommended for you</h1>

          <p>
            Based on your watched movies, ratings and favorite genres, Cinevio
            suggests movies and series you have not watched yet.
          </p>

          <div className="recommendation-reason">
            <strong>How it works?</strong>

            <span>
              Cinevio analyzes your ratings and watched content, then recommends
              similar titles from your local database.
            </span>
          </div>
        </div>

        {recommendedMovies.length === 0 ? (
          <div className="empty-state">
            <h2>No recommendations yet</h2>

            <p>
              Rate a few movies or series first, and Cinevio will build your
              recommendation list.
            </p>
          </div>
        ) : (
          <div className="movie-grid">
            {recommendedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Recommendations;
