import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Watchlist from "./pages/Watchlist";
import AdminDashboard from "./pages/AdminDashboard";
import TopMovies from "./pages/TopMovies";
import TopSeries from "./pages/TopSeries";
import SeriesDetails from "./pages/SeriesDetails";
import Profile from "./pages/Profile";
import Recommendations from "./pages/Recommendations";
import Details from "./pages/Details";
import NotFound from "./pages/NotFound";
import ContentRequest from "./pages/ContentRequest";
import AdminUsers from "./pages/AdminUsers";
import AdminActivity from "./pages/AdminActivity";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES */}

        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/details/:id" element={<Details />} />
        <Route path="/series-details/:id" element={<SeriesDetails />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED USER ROUTES */}

        <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
        <Route path="/top-movies" element={<ProtectedRoute><TopMovies /></ProtectedRoute>} />
        <Route path="/top-series" element={<ProtectedRoute><TopSeries /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="/request-content" element={<ProtectedRoute><ContentRequest /></ProtectedRoute>} />

        {/* ADMIN ROUTE */}

        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/activity" element={<ProtectedRoute adminOnly={true}><AdminActivity /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
