import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import AmbientBackground from "../components/AmbientBackground";
import { useAuth } from "../context/auth";

function Register() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      login(res.data.user, res.data.token);

      navigate("/");
    } catch (error) {
      console.log(error);
      alert("Registration failed. Try another email.");
    }
  }

  return (
    <main className="auth-page">
      <AmbientBackground />

      <section className="auth-card">
        <div className="auth-left">
          <span className="eyebrow">Join Cinevio</span>

          <h1>Create your cinema profile.</h1>

          <p>
            Build your watch history, rate movies, start discussions and create
            your personal top lists.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <h2>Register</h2>

          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              placeholder="Choose username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

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
              placeholder="Create password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit">
            Create Account
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;
