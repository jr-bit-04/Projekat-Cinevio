import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import MovieCard from "../components/MovieCard";
import AmbientBackground from "../components/AmbientBackground";
import FloatingOrbs from "../components/FloatingOrbs";

function Home() {
  const featuredMovies = [
    {
      id: 1,
      title: "Interstellar",
      type: "Movie",
      year: "2014",
      rating: "8.7",
      image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    },
    {
      id: 2,
      title: "Breaking Bad",
      type: "Series",
      year: "2008",
      rating: "9.5",
      image: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    },
    {
      id: 3,
      title: "Dune",
      type: "Movie",
      year: "2021",
      rating: "8.0",
      image: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    },
  ];

  const trendingMovies = [
    {
      id: 4,
      title: "Inception",
      type: "Movie",
      year: "2010",
      rating: "8.8",
      image: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    },
    {
      id: 5,
      title: "The Batman",
      type: "Movie",
      year: "2022",
      rating: "7.8",
      image: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    },
    {
      id: 6,
      title: "Oppenheimer",
      type: "Movie",
      year: "2023",
      rating: "8.5",
      image: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    },
  ];

  return (
    <main>
      <AmbientBackground />
      <FloatingOrbs />

      <section className="cinematic-hero">
        <div className="hero-bg-image"></div>
        <div className="hero-dark-overlay"></div>

        <motion.div
          className="container cinematic-hero-content"
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="hero-left">
            <span className="eyebrow">Track your cinema universe</span>

            <h1>
              Your personal
              <br />
              cinematic
              <br />
              <span>command center.</span>
            </h1>

            <p>
              Discover, save, rate, review and organize every movie and series
              you watch. Cinevio turns your watch history into a cinematic
              universe.
            </p>

            <div className="hero-actions">
              <Link to="/movies">
                <button>▶ Explore Movies</button>
              </Link>

              <Link to="/series">
                <button>
                  ◉ Explore Series
                </button>
              </Link>

              <Link to="/watchlist">
                <button className="glass-btn">
                  ▱ My Watchlist
                </button>
              </Link>
            </div>

            <div className="hero-stats-glass">
              <div>
                <strong>12K+</strong>
                <span>Movies tracked</span>
              </div>

              <div>
                <strong>4K+</strong>
                <span>Series tracked</span>
              </div>

              <div>
                <strong>18K+</strong>
                <span>Reviews written</span>
              </div>

              <div>
                <strong>9K+</strong>
                <span>Active users</span>
              </div>
            </div>
          </div>

          <div className="hero-feature-strip">
            <div>
              <span>▱</span>
              <h3>Save & Organize</h3>
              <p>Build your watchlist and manage what you love.</p>
            </div>

            <div>
              <span>★</span>
              <h3>Rate & Review</h3>
              <p>Rate movies and series and share honest reviews.</p>
            </div>

            <div>
              <span>◌</span>
              <h3>Join the Community</h3>
              <p>Discuss, create lists and connect with movie lovers.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container section">
        <div className="section-header">
          <h2>Featured Picks</h2>
          <p>Curated recommendations based on what Cinevio users love.</p>
        </div>

        <div className="movie-grid">
          {featuredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-header">
          <h2>Trending Right Now</h2>
          <p>The most watched and discussed titles this week.</p>
        </div>

        <div className="movie-grid">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="premium-banner">
          <div className="premium-content">
            <span className="eyebrow">Cinevio Community</span>

            <h2>Discuss movies, create rankings, and share your reviews.</h2>

            <p>
              Join movie and series fans building personal cinematic
              collections, top lists, discussions and reviews.
            </p>

            <button>Start Exploring</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;