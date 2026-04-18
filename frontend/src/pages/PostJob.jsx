import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function PostJob() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("hirehubUser"));
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    employerId: user?.id || ""
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
      await api.post("/jobs", formData);
      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not post job");
    }
  };

  if (!user || user.role !== "EMPLOYER") {
    return (
      <div className="card auth-card">
        <span className="eyebrow">Restricted</span>
        <h2>Post Job</h2>
        <p>Only employers can post jobs.</p>
      </div>
    );
  }

  return (
    <div className="post-job-layout">
      <div className="auth-panel auth-panel-highlight">
        <span className="eyebrow">Employer space</span>
        <h1>Create a role that stands out.</h1>
        <p>
          Add the title, location, and a short description to publish a new opening for job
          seekers.
        </p>
      </div>

      <div className="card auth-card">
        <span className="eyebrow">New job</span>
        <h2>Post a job</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Job title
            <input
              type="text"
              name="title"
              placeholder="Frontend Developer"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              placeholder="Write a short description about the role"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </label>
          <label>
            Location
            <input
              type="text"
              name="location"
              placeholder="Bangalore"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Post Job</button>
        </form>
        {message && <p className="message error">{message}</p>}
      </div>
    </div>
  );
}

export default PostJob;
