import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/auth/login", formData);
      localStorage.setItem("hirehubUser", JSON.stringify(response.data));
      navigate("/");
      window.location.reload();
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel auth-panel-highlight">
        <span className="eyebrow">HireHub access</span>
        <h1>Welcome back to your hiring workspace.</h1>
        <p>
          Sign in to explore job openings, review applicants, and keep your hiring process in one
          simple place.
        </p>
        <div className="feature-list">
          <div className="feature-chip">View live job listings</div>
          <div className="feature-chip">Track applications easily</div>
          <div className="feature-chip">Post jobs in minutes</div>
        </div>
      </div>

      <div className="card auth-card">
        <span className="eyebrow">Login</span>
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Login</button>
        </form>
        {message && <p className="message error">{message}</p>}
        <p className="auth-switch">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
