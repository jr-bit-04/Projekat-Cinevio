import { useEffect, useState } from "react";

import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";
import AmbientBackground from "../components/AmbientBackground";
import api from "../services/api";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);

  const [genre, setGenre] = useState("All");
  const [year, setYear] = useState("All");
  const [rating, setRating] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage,setCurrentPage] = useState(1);
  const moviesPerPage = 15;


  const genres = [
    "All",
    "Action",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
  ];

  const years = ["All", "2024", "2023", "2022", "2021", "2014", "2010"];
  const ratings = ["All", "9+", "8+", "7+"];

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredMovies]);

  async function fetchMovies() {
    try {
      const res = await api.get("/content");

      const onlyMovies = res.data
        .filter((item) => item.type === "movie")
        .map((item) => ({
          id: item.id,
          title: item.title,
          type: "Movie",
          year: String(item.release_year),
          rating: item.rating,
          genre: item.genre,
          image: item.poster_url,
        }));

      setMovies(onlyMovies);
      //handleSort();
      setFilteredMovies(onlyMovies);
    } catch (error) {
      console.log(error);
    }
  }

  function applyAllFilters(currentSearch = searchTerm) {
    let result = movies;

    if (currentSearch.trim() !== "") {
      result = result.filter((movie) =>
        movie.title.toLowerCase().includes(currentSearch.toLowerCase())
      );
    }

    if (genre !== "All") {
      result = result.filter((movie) => movie.genre?.includes(genre));
    }

    if (year !== "All") {
      result = result.filter((movie) => movie.year === year);
    }

    if (rating !== "All") {
      const minRating = Number(rating.replace("+", ""));
      result = result.filter((movie) => Number(movie.rating) >= minRating);
    }

    setFilteredMovies(result);
  }

  function handleFilter() {
    applyAllFilters();
  }

  async function handleSearch(value) {
  setSearchTerm(value);

  if (!value.trim()) {
    setFilteredMovies(movies);
    return;
  }

  try {
      const res = await api.get(
        `/content/search?query=${encodeURIComponent(value)}&type=movie`
      );

    const searchedMovies = res.data.map((item) => ({
      id: item.id,
      title: item.title,
      type: "Movie",
      year: String(item.release_year),
      rating: item.rating,
      genre: item.genre,
      image: item.poster_url,
    }));

    setFilteredMovies(searchedMovies);
  } catch (error) {
    console.log(error);
  }
}

  function handleClearFilters() {
    setGenre("All");
    setYear("All");
    setRating("All");
    setSearchTerm("");
    fetchMovies();
  }
  /*
  function handleSort(){
    const sorted = [...filteredMovies].sort((a,b) =>{
      return b.rating - a.rating;
    })
    setFilteredMovies(sorted);
  }*/
 const totalPages = Math.ceil(filteredMovies.length/moviesPerPage);
 const startIndex = (currentPage-1)*moviesPerPage;
 const currentMovies = filteredMovies.slice(startIndex,startIndex+moviesPerPage);


  return (
    <main>
      <AmbientBackground />

      <section className="container page">
        <div className="page-header">
          <span className="eyebrow">Movie library</span>

          <h1>All Movies</h1>

          <p>Search, filter and organize movies by genre, year and rating.</p>
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
        {/*<button className="clear-filters clean-filters-btn"
          onClick={handleSort}
        >Sortiraj</button>*/}
        {filteredMovies.length === 0 ? (
          <div className="empty-state">
            <h2>No movies found</h2>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
              <>
                <div className="movie-grid">
                  {currentMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={page === currentPage ? "page-btn active" : "page-btn"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
      </section>
    </main>
  );
}

export default Movies;
