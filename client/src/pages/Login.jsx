import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import AmbientBackground from "../components/AmbientBackground";
import { useAuth } from "../context/auth";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      login(res.data.user, res.data.token);
      
      navigate("/");
    } catch (error) {
      console.log(error);
      alert("Login failed. Check your email and password.");
    }
  }

  return (
    <main className="auth-page">
      <AmbientBackground />

      <section className="auth-card">
        <div className="auth-left">
          <span className="eyebrow">Welcome back</span>

          <h1>Continue your cinematic journey.</h1>

          <p>
            Access your watchlists, reviews, ratings and personal movie universe.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Login</h2>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit">
            Login
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
