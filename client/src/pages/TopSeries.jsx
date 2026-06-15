import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function TopSeries() {
  const [topSeries, setTopSeries] = useState([]);
  const [rankingBusy, setRankingBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  async function fetchTopSeries() {
    try {
      const res = await api.get("/top-lists/top_series");

      setTopSeries(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTopSeries();
  }, []);

  async function persistRanking(rankedSeries) {
    setRankingBusy(true);

    try {
      await Promise.all(
        rankedSeries.map((series) =>
          api.post("/top-lists", {
            content_id: series.id,
            list_type: "top_series",
            position: series.position,
          })
        )
      );
    } catch (error) {
      console.log(error);
      fetchTopSeries();
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

    setTopSeries((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);

      return next.map((series, i) => ({ ...series, position: i + 1 }));
    });

    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);

    setTopSeries((current) => {
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

          <h1>Top Series</h1>

          <p>Drag and drop to reorder your favorite series.</p>
        </div>

        {topSeries.length === 0 ? (
          <div className="empty-state">
            <h2>No top series yet</h2>
            <p>Add series to your top list from the details page.</p>
          </div>
        ) : (
          <div className="top-list">
            {topSeries.map((series, index) => (
              <div
                className={
                  dragIndex === index
                    ? "top-list-item dragging"
                    : "top-list-item"
                }
                key={series.top_id}
                draggable={!rankingBusy}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(event) => event.preventDefault()}
                onDragEnd={handleDragEnd}
              >
                <div className="top-position">
                  #{index + 1}
                </div>

                <Link
                  className="top-list-main"
                  to={`/series-details/${series.id}`}
                >
                  <h3>{series.title}</h3>
                  <p>{series.genre}</p>
                </Link>

                <span>⭐ {series.rating}</span>

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

export default TopSeries;
