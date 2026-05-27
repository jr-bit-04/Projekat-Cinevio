import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function TopMovies() {
  const [topMovies, setTopMovies] = useState([]);
  const [rankingBusy, setRankingBusy] = useState(false);

  async function fetchTopMovies() {
    try {
      const res = await api.get("/top-lists/top_movies");

      setTopMovies(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTopMovies();
  }, []);

  async function saveMovieRanking(nextMovies) {
    const rankedMovies = nextMovies.map((movie, index) => ({
      ...movie,
      position: index + 1,
    }));

    setTopMovies(rankedMovies);
    setRankingBusy(true);

    try {
      await Promise.all(
        rankedMovies.map((movie) =>
          api.post("/top-lists", {
            content_id: movie.id,
            list_type: "top_movies",
            position: movie.position,
          })
        )
      );
    } catch (error) {
      console.log(error);
      fetchTopMovies();
    } finally {
      setRankingBusy(false);
    }
  }

  function moveMovie(index, direction) {
    const nextIndex = index + direction;

    if (
      rankingBusy ||
      nextIndex < 0 ||
      nextIndex >= topMovies.length
    ) {
      return;
    }

    const nextMovies = [...topMovies];
    const currentMovie = nextMovies[index];

    nextMovies[index] = nextMovies[nextIndex];
    nextMovies[nextIndex] = currentMovie;

    saveMovieRanking(nextMovies);
  }

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">Personal ranking</span>

          <h1>Top Movies</h1>

          <p>Your favorite movies, ranked by you.</p>
        </div>

        {topMovies.length === 0 ? (
          <div className="empty-state">
            <h2>No top movies yet</h2>
            <p>Add movies to your top list from the details page.</p>
          </div>
        ) : (
          <div className="top-list">
            {topMovies.map((movie, index) => (
              <div className="top-list-item" key={movie.top_id}>
                <div className="top-position">
                  #{movie.position || index + 1}
                </div>

                <Link className="top-list-main" to={`/details/${movie.id}`}>
                  <h3>{movie.title}</h3>
                  <p>{movie.genre}</p>
                </Link>

                <span>⭐ {movie.rating}</span>
                <div className="top-rank-actions">
                  <button
                    onClick={() => moveMovie(index, -1)}
                    disabled={rankingBusy || index === 0}
                  >
                    Up
                  </button>

                  <button
                    onClick={() => moveMovie(index, 1)}
                    disabled={rankingBusy || index === topMovies.length - 1}
                  >
                    Down
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default TopMovies;
