import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function TopMovies() {
  const [topMovies, setTopMovies] = useState([]);
  const [rankingBusy, setRankingBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

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

  async function persistRanking(rankedMovies) {
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

  function handleDragStart(index) {
    if (rankingBusy) return;
    setDragIndex(index);
  }

  function handleDragEnter(index) {
    if (dragIndex === null || dragIndex === index) return;

    setTopMovies((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);

      return next.map((movie, i) => ({ ...movie, position: i + 1 }));
    });

    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);

    setTopMovies((current) => {
      persistRanking(current);
      return current;
    });
  }

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">Personal ranking</span>

          <h1>Top Movies</h1>

          <p>Drag and drop to reorder your favorite movies.</p>
        </div>

        {topMovies.length === 0 ? (
          <div className="empty-state">
            <h2>No top movies yet</h2>
            <p>Add movies to your top list from the details page.</p>
          </div>
        ) : (
          <div className="top-list">
            {topMovies.map((movie, index) => (
              <div
                className={
                  dragIndex === index
                    ? "top-list-item dragging"
                    : "top-list-item"
                }
                key={movie.top_id}
                draggable={!rankingBusy}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(event) => event.preventDefault()}
                onDragEnd={handleDragEnd}
              >
                <div className="top-position">
                  #{index + 1}
                </div>

                <Link className="top-list-main" to={`/details/${movie.id}`}>
                  <h3>{movie.title}</h3>
                  <p>{movie.genre}</p>
                </Link>

                <span>⭐ {movie.rating}</span>

                <div className="top-drag-handle" title="Drag to reorder">
                  ⋮⋮
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
