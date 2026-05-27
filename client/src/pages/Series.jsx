import { useEffect, useState } from "react";

import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";
import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function Series() {
  const [series, setSeries] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);

  const [genre, setGenre] = useState("All");
  const [year, setYear] = useState("All");
  const [rating, setRating] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const genres = [
    "All",
    "Action",
    "Comedy",
    "Crime",
    "Drama",
    "Fantasy",
    "Mystery",
    "Sci-Fi",
    "Thriller",
    "TMDB",
    "Popular",
  ];

  const years = [
    "All",
    "2026",
    "2025",
    "2024",
    "2023",
    "2022",
    "2021",
    "2020",
    "2019",
    "2017",
    "2016",
    "2008",
  ];

  const ratings = ["All", "9+", "8+", "7+", "6+"];

  useEffect(() => {
    fetchSeries();
  }, []);

  async function fetchSeries() {
    try {
      const res = await api.get("/content");

      const onlySeries = res.data
        .filter((item) => item.type === "series")
        .map((item) => ({
          id: item.id,
          title: item.title,
          type: "Series",
          year: String(item.release_year),
          rating: item.rating,
          genre: item.genre,
          image: item.poster_url,
        }));

      setSeries(onlySeries);
      setFilteredSeries(onlySeries);
    } catch (error) {
      console.log(error);
    }
  }

  function applyAllFilters(currentSearch = searchTerm) {
    let result = series;

    if (currentSearch.trim() !== "") {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(currentSearch.toLowerCase())
      );
    }

    if (genre !== "All") {
      result = result.filter((item) => item.genre?.includes(genre));
    }

    if (year !== "All") {
      result = result.filter((item) => item.year === year);
    }

    if (rating !== "All") {
      const minRating = Number(rating.replace("+", ""));
      result = result.filter((item) => Number(item.rating) >= minRating);
    }

    setFilteredSeries(result);
  }

  async function handleSearch(value) {
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredSeries(series);
      return;
    }

    try {
      const res = await api.get(
        `/content/search?query=${encodeURIComponent(value)}&type=series`
      );

      const searchedSeries = res.data.map((item) => ({
        id: item.id,
        title: item.title,
        type: "Series",
        year: String(item.release_year),
        rating: item.rating,
        genre: item.genre,
        image: item.poster_url,
      }));

      setFilteredSeries(searchedSeries);
    } catch (error) {
      console.log(error);
    }
  }

  function handleFilter() {
    applyAllFilters();
  }

  function handleClearFilters() {
    setGenre("All");
    setYear("All");
    setRating("All");
    setSearchTerm("");
    fetchSeries();
  }

  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">Series library</span>

          <h1>All Series</h1>

          <p>Search, filter and organize series by genre, year and rating.</p>
        </div>

        <SearchBar onSearch={handleSearch} />

        <div className="filter-panel">
          <div className="filter-group">
            <label>Genre</label>

            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
            >
              {genres.map((genreItem) => (
                <option key={genreItem} value={genreItem}>
                  {genreItem}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Year</label>

            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
            >
              {years.map((yearItem) => (
                <option key={yearItem} value={yearItem}>
                  {yearItem}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Rating</label>

            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            >
              {ratings.map((ratingItem) => (
                <option key={ratingItem} value={ratingItem}>
                  {ratingItem}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button className="apply-filters" onClick={handleFilter}>
              Filter
            </button>
          </div>
        </div>

        <button
          className="clear-filters clean-filters-btn"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>

        {filteredSeries.length === 0 ? (
          <div className="empty-state">
            <h2>No series found</h2>
            <p>Try searching for a series name.</p>
          </div>
        ) : (
          <div className="movie-grid">
            {filteredSeries.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Series;
