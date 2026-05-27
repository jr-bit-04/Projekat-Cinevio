import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";
import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function Watchlist() {
  const [moviesToWatch, setMoviesToWatch] = useState([]);
  const [seriesToWatch, setSeriesToWatch] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchedSeries, setWatchedSeries] = useState([]);

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

      setMoviesToWatch(
        mappedItems.filter(
          (item) => item.status === "watchlist" && item.type === "Movie"
        )
      );

      setSeriesToWatch(
        mappedItems.filter(
          (item) => item.status === "watchlist" && item.type === "Series"
        )
      );

      setWatchedMovies(
        mappedItems.filter(
          (item) => item.status === "watched" && item.type === "Movie"
        )
      );

      setWatchedSeries(
        mappedItems.filter(
          (item) => item.status === "watched" && item.type === "Series"
        )
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

        <section className="watchlist-dashboard">
          <div className="watchlist-stat">
            <h3>{moviesToWatch.length}</h3>
            <p>Movies to watch</p>
          </div>

          <div className="watchlist-stat">
            <h3>{seriesToWatch.length}</h3>
            <p>Series to watch</p>
          </div>

          <div className="watchlist-stat">
            <h3>{watchedMovies.length}</h3>
            <p>Watched movies</p>
          </div>

          <div className="watchlist-stat">
            <h3>{watchedSeries.length}</h3>
            <p>Watched series</p>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Movies To Watch</h2>
            <p>Movies saved for your next cinematic session.</p>
          </div>

          {moviesToWatch.length === 0 ? (
            <div className="empty-state">
              <h2>No movies saved yet</h2>
              <p>Start adding movies you want to watch.</p>
            </div>
          ) : (
            <div className="movie-grid">
              {moviesToWatch.map((movie) => (
                <MovieCard key={movie.watchlistId} movie={movie} />
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Series To Watch</h2>
            <p>Series saved for later watching.</p>
          </div>

          {seriesToWatch.length === 0 ? (
            <div className="empty-state">
              <h2>No series saved yet</h2>
              <p>Start adding series you want to watch.</p>
            </div>
          ) : (
            <div className="movie-grid">
              {seriesToWatch.map((series) => (
                <MovieCard key={series.watchlistId} movie={series} />
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Watched Movies</h2>
            <p>Your completed movie history.</p>
          </div>

          {watchedMovies.length === 0 ? (
            <div className="empty-state">
              <h2>No watched movies yet</h2>
              <p>Once you finish movies, they will appear here.</p>
            </div>
          ) : (
            <div className="movie-grid">
              {watchedMovies.map((movie) => (
                <MovieCard key={movie.watchlistId} movie={movie} />
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Watched Series</h2>
            <p>Your completed series history.</p>
          </div>

          {watchedSeries.length === 0 ? (
            <div className="empty-state">
              <h2>No watched series yet</h2>
              <p>Once you finish series, they will appear here.</p>
            </div>
          ) : (
            <div className="movie-grid">
              {watchedSeries.map((series) => (
                <MovieCard key={series.watchlistId} movie={series} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Watchlist;
