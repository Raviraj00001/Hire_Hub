import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "JOB_SEEKER"
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
      await api.post("/auth/register", formData);
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel auth-panel-highlight">
        <span className="eyebrow">Create account</span>
        <h1>Start using HireHub in a few quick steps.</h1>
        <p>
          Register as a job seeker to apply quickly, or sign up as an employer to publish and
          manage openings from one dashboard.
        </p>
        <div className="feature-list">
          <div className="feature-chip">Choose your role</div>
          <div className="feature-chip">Save your login locally</div>
          <div className="feature-chip">Begin exploring right away</div>
        </div>
      </div>

      <div className="card auth-card">
        <span className="eyebrow">Register</span>
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Role
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="JOB_SEEKER">Job Seeker</option>
              <option value="EMPLOYER">Employer</option>
            </select>
          </label>
          <button type="submit">Register</button>
        </form>
        {message && <p className="message error">{message}</p>}
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
