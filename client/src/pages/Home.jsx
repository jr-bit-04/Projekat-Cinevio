import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import MovieCard from "../components/MovieCard";
import AmbientBackground from "../components/AmbientBackground";
import FloatingOrbs from "../components/FloatingOrbs";
import api from "../services/api";

function Home() {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);

  useEffect(() => {
    fetchContent();
  }, []);

  // mapiramo u oblik koji MovieCard očekuje
  function mapContent(item) {
    return {
      id: item.id,                                    // PRAVI id iz baze
      title: item.title,
      type: item.type === "series" ? "Series" : "Movie",
      year: String(item.release_year),
      rating: item.rating,
      image: item.poster_url,                         // PRAVA slika iz baze
    };
  }

  async function fetchContent() {
    try {
      // Featured ostaje od najnovijeg sadržaja
      const res = await api.get("/content");
      const mapped = res.data.map(mapContent);
      setFeaturedMovies(mapped.slice(0, 3));

      // Trending = sadržaj sa najviše korisničkih interakcija (watched / watchlist)
      const trendingRes = await api.get("/content/trending", {
        params: { limit: 3 },
      });
      setTrendingMovies(trendingRes.data.map(mapContent));
    } catch (error) {
      console.log(error);
    }
  }


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