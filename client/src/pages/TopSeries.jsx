import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function TopSeries() {
  const [topSeries, setTopSeries] = useState([]);
  const [rankingBusy, setRankingBusy] = useState(false);

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

  async function saveSeriesRanking(nextSeries) {
    const rankedSeries = nextSeries.map((series, index) => ({
      ...series,
      position: index + 1,
    }));

    setTopSeries(rankedSeries);
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

  function moveSeries(index, direction) {
    const nextIndex = index + direction;

    if (
      rankingBusy ||
      nextIndex < 0 ||
      nextIndex >= topSeries.length
    ) {
      return;
    }

    const nextSeries = [...topSeries];
    const currentSeries = nextSeries[index];

    nextSeries[index] = nextSeries[nextIndex];
    nextSeries[nextIndex] = currentSeries;

    saveSeriesRanking(nextSeries);
  }

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">Personal ranking</span>

          <h1>Top Series</h1>

          <p>Your favorite series, ranked by you.</p>
        </div>

        {topSeries.length === 0 ? (
          <div className="empty-state">
            <h2>No top series yet</h2>
            <p>Add series to your top list from the details page.</p>
          </div>
        ) : (
          <div className="top-list">
            {topSeries.map((series, index) => (
              <div className="top-list-item" key={series.top_id}>
                <div className="top-position">
                  #{series.position || index + 1}
                </div>

                <Link
                  className="top-list-main"
                  to={`/series-details/${series.id}`}
                >
                  <h3>{series.title}</h3>
                  <p>{series.genre}</p>
                </Link>

                <span>⭐ {series.rating}</span>
                <div className="top-rank-actions">
                  <button
                    onClick={() => moveSeries(index, -1)}
                    disabled={rankingBusy || index === 0}
                  >
                    Up
                  </button>

                  <button
                    onClick={() => moveSeries(index, 1)}
                    disabled={rankingBusy || index === topSeries.length - 1}
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

export default TopSeries;
