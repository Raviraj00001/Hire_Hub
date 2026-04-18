import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function JobsList() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("hirehubUser"));
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (user?.role === "JOB_SEEKER") {
      fetchAppliedJobs();
    }

    if (user?.role === "EMPLOYER") {
      fetchEmployerJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const endpoint = user?.role === "EMPLOYER" ? `/jobs?employerId=${user.id}` : "/jobs";
      const response = await api.get(endpoint);
      setJobs(response.data);
    } catch (error) {
      setMessage("Could not load jobs");
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await api.get(`/applications/user/${user.id}`);
      setAppliedJobs(response.data);
    } catch (error) {
      setMessage("Could not load applied jobs");
    }
  };

  const fetchEmployerJobs = async () => {
    try {
      const response = await api.get(`/jobs?employerId=${user.id}`);
      setMyJobs(response.data);
      fetchApplicantCounts(response.data);
    } catch (error) {
      setMessage("Could not load your jobs");
    }
  };

  const fetchApplicantCounts = async (employerJobs) => {
    try {
      const counts = {};
      const results = await Promise.all(
        employerJobs.map((job) => api.get(`/applications/job/${job.id}`))
      );

      employerJobs.forEach((job, index) => {
        counts[job.id] = results[index].data.length;
      });

      setApplicantCounts(counts);
    } catch (error) {
      setMessage("Could not load applicant counts");
    }
  };

  const isApplied = (jobId) => {
    return appliedJobs.some((application) => application.jobId === jobId);
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}?employerId=${user.id}`);
      setMessage("Job deleted successfully");
      fetchJobs();
      fetchEmployerJobs();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete job");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesTitle = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = job.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesTitle && matchesLocation;
  });

  const totalApplicants = Object.values(applicantCounts).reduce((sum, count) => sum + count, 0);

  if (!user) {
    return (
      <div className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Modern job portal</span>
          <h1>Discover roles, post openings, and manage hiring in one clean space.</h1>
          <p>
            HireHub keeps the workflow simple for beginners while still feeling polished and
            modern.
          </p>
          <div className="action-row">
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")} className="secondary-button">
              Register
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="card stat-card">
            <span>For job seekers</span>
            <strong>Browse jobs and apply faster</strong>
          </div>
          <div className="card stat-card">
            <span>For employers</span>
            <strong>Post openings and view applicants clearly</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <section className="hero-banner">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>{user.role === "EMPLOYER" ? "Manage your hiring pipeline" : "Find your next job opportunity"}</h1>
          <p>
            {user.role === "EMPLOYER"
              ? "See only your own job posts, track applicant counts, and open each role to review seeker details."
              : "Browse every opening, open job details, and keep an eye on your applications."}
          </p>
        </div>
        <div className="hero-summary">
          <div>
            <span>Total jobs</span>
            <strong>{filteredJobs.length}</strong>
          </div>
          <div>
            <span>{user.role === "EMPLOYER" ? "Applicants" : "Applied"}</span>
            <strong>{user.role === "EMPLOYER" ? totalApplicants : appliedJobs.length}</strong>
          </div>
        </div>
      </section>

      <div className="grid-layout">
      <div className="main-column">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Jobs</span>
            <h2>{user.role === "EMPLOYER" ? "Your posted jobs" : "Available opportunities"}</h2>
          </div>
        </div>

        <div className="card filter-card">
          <div className="filter-grid">
            <label>
              Search by title
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <label>
              Filter by location
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
              />
            </label>
          </div>
        </div>

        {message && <p className="message error">{message}</p>}

        {filteredJobs.length === 0 ? (
          <div className="card empty-card">
            <p>
              {user.role === "EMPLOYER"
                ? "No matching jobs found in your posted jobs."
                : "No matching jobs found."}
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="card job-card">
              <div className="job-card-top">
                <div>
                  <span className="eyebrow">Open role</span>
                  <h3>{job.title}</h3>
                </div>
                <span className="location-pill">{job.location}</span>
              </div>
              <p>{job.description}</p>
              {user.role === "EMPLOYER" && (
                <div className="job-meta-row">
                  <span className="badge info-badge">
                    Applicants: {applicantCounts[job.id] ?? 0}
                  </span>
                </div>
              )}
              <div className="action-row">
                <Link to={`/jobs/${job.id}`} className="button-link">
                  {user.role === "EMPLOYER" ? "Manage Applicants" : "View Details"}
                </Link>
                {user.role === "JOB_SEEKER" && isApplied(job.id) && (
                  <span className="badge">Applied</span>
                )}
                {user.role === "EMPLOYER" && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    Delete Job
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="side-column">
        <div className="card profile-card">
          <span className="eyebrow">Profile</span>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span className="role-pill">{user.role.replace("_", " ")}</span>
        </div>

        {user.role === "JOB_SEEKER" && (
          <div className="card">
            <span className="eyebrow">My activity</span>
            <h3>Applied jobs</h3>
            {appliedJobs.length === 0 ? (
              <p>You have not applied yet.</p>
            ) : (
              appliedJobs.map((application) => (
                <div key={application.id} className="mini-list-item">
                  <div>
                    <span>{application.jobTitle}</span>
                    <p className="applicant-meta">Resume: {application.resumeFileName}</p>
                    <p className="applicant-meta">
                      Status: {application.shortlisted ? "Shortlisted" : "Under Review"}
                    </p>
                  </div>
                  {application.resumeUrl ? (
                    <a
                      href={`http://localhost:8081${application.resumeUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="button-link"
                    >
                      View Resume
                    </a>
                  ) : (
                    <span className="badge">No Resume</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {user.role === "EMPLOYER" && (
          <div className="card">
            <span className="eyebrow">My hiring</span>
            <h3>Posted jobs</h3>
            {myJobs.length === 0 ? (
              <p>You have not posted a job yet.</p>
            ) : (
              myJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="mini-list-item">
                  <span>{job.title}</span>
                  <strong>{applicantCounts[job.id] ?? 0} applicants</strong>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default JobsList;
