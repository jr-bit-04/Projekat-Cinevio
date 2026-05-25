import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";
import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function Watchlist() {
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);

  async function fetchWatchlist() {
    try {
      const res = await api.get("/watchlist");

      const mappedItems = res.data.map((item) => ({
        id: item.id,
        watchlistId: item.watchlist_id,
        title: item.title,
        type: item.type === "series" ? "Series" : "Movie",
        year: String(item.release_year),
        rating: item.rating,
        image: item.poster_url,
        status: item.status,
      }));

      setWatchlistMovies(
        mappedItems.filter((item) => item.status === "watchlist")
      );

      setWatchedMovies(
        mappedItems.filter((item) => item.status === "watched")
      );
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWatchlist();
  }, []);

  return (
    <main className="watchlist-page">
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">My cinema space</span>

          <h1>Watchlist</h1>

          <p>
            Manage what you want to watch and keep track of everything you
            already finished.
          </p>
        </div>

        <section className="watchlist-dashboard two-cards">
          <div className="watchlist-stat">
            <h3>{watchlistMovies.length}</h3>
            <p>Movies to watch</p>
          </div>

          <div className="watchlist-stat">
            <h3>{watchedMovies.length}</h3>
            <p>Watched movies</p>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>To Watch</h2>
            <p>Movies and series saved for your next cinematic session.</p>
          </div>

          {watchlistMovies.length === 0 ? (
            <div className="empty-state">
              <h2>Your watchlist is empty</h2>
              <p>Start adding movies and series you want to watch.</p>
            </div>
          ) : (
            <div className="movie-grid">
              {watchlistMovies.map((movie) => (
                <MovieCard key={movie.watchlistId} movie={movie} />
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Watched</h2>
            <p>Your completed movie history and cinematic journey.</p>
          </div>

          {watchedMovies.length === 0 ? (
            <div className="empty-state">
              <h2>No watched movies yet</h2>
              <p>Once you finish movies or series, they will appear here.</p>
            </div>
          ) : (
            <div className="movie-grid">
              {watchedMovies.map((movie) => (
                <MovieCard key={movie.watchlistId} movie={movie} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Watchlist;
