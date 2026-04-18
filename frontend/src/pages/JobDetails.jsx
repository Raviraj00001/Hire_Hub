import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function JobDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("hirehubUser"));
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [message, setMessage] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [specification, setSpecification] = useState("Java, Spring Boot, MySQL, REST API");
  const [analysisResults, setAnalysisResults] = useState({});

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);

      if (user?.role === "EMPLOYER") {
        fetchApplicants(response.data.id, response.data.employerId);
      }

      if (user?.role === "JOB_SEEKER") {
        checkIfAlreadyApplied(response.data.id);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load job details");
    }
  };

  const fetchApplicants = async (jobId, employerId) => {
    if (!user || user.id !== employerId) {
      return;
    }

    try {
      const response = await api.get(`/applications/job/${jobId}`);
      setApplicants(response.data);
    } catch (error) {
      setMessage("Could not load applicants");
    }
  };

  const checkIfAlreadyApplied = async (jobId) => {
    try {
      const response = await api.get(`/applications/user/${user.id}`);
      const alreadyApplied = response.data.some((application) => application.jobId === Number(jobId));
      setHasApplied(alreadyApplied);
    } catch (error) {
      setMessage("Could not check your application status");
    }
  };

  const handleApply = async () => {
    if (!user) {
      setMessage("Please login first");
      return;
    }

    if (hasApplied) {
      setMessage("You already applied to this job");
      return;
    }

    if (!resumeFile) {
      setMessage("Please upload your resume before applying");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("jobId", job.id);
      formData.append("resume", resumeFile);

      await api.post("/applications/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setMessage("Application submitted successfully");
      setHasApplied(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not apply");
    }
  };

  const handleSendShortlistEmail = async (applicationId) => {
    try {
      setSendingEmailId(applicationId);
      const response = await api.post(`/applications/${applicationId}/shortlist?employerId=${user.id}`);
      setApplicants((currentApplicants) =>
        currentApplicants.map((applicant) =>
          applicant.id === applicationId ? response.data : applicant
        )
      );
      setMessage("Shortlist email sent successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not send shortlist email");
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleAnalyzeResume = async (applicationId) => {
    if (!specification.trim()) {
      setMessage("Please enter required skills or specification first");
      return;
    }

    try {
      setAnalyzingId(applicationId);
      const response = await api.post(
        `/applications/${applicationId}/analyze?employerId=${user.id}`,
        { specification }
      );
      setAnalysisResults((currentResults) => ({
        ...currentResults,
        [applicationId]: response.data
      }));
      setMessage("Resume analyzed successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not analyze resume");
    } finally {
      setAnalyzingId(null);
    }
  };

  if (!job) {
    return <div className="card">{message || "Loading..."}</div>;
  }

  return (
    <div className="details-layout">
      <div className="card details-card">
        <div className="job-card-top">
          <div>
            <span className="eyebrow">Job details</span>
            <h2>{job.title}</h2>
          </div>
          <span className="location-pill">{job.location}</span>
        </div>

        <p className="details-copy">{job.description}</p>

        <div className="info-grid">
          <div className="info-box">
            <span>Location</span>
            <strong>{job.location}</strong>
          </div>
          <div className="info-box">
            <span>Employer ID</span>
            <strong>{job.employerId}</strong>
          </div>
          <div className="info-box">
            <span>Job ID</span>
            <strong>{job.id}</strong>
          </div>
        </div>

        {user?.role === "JOB_SEEKER" && (
          <div className="apply-box">
            {hasApplied ? (
              <div className="already-applied-box">
                <span className="badge">Applied</span>
                <p>You already applied to this job. You cannot apply again after refresh either.</p>
              </div>
            ) : (
              <>
                <label>
                  Upload resume
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setResumeFile(event.target.files[0])}
                  />
                </label>
                <button onClick={handleApply}>Apply to Job</button>
              </>
            )}
          </div>
        )}

        {message && <p className="message">{message}</p>}
      </div>

      {user?.role === "EMPLOYER" && user.id === job.employerId && (
        <div className="card applicants-card">
          <span className="eyebrow">Applicants</span>
          <h3>Who applied to this role</h3>
          <div className="analysis-spec-box">
            <label>
              Required skills or specification
              <textarea
                rows="4"
                value={specification}
                onChange={(event) => setSpecification(event.target.value)}
                placeholder="Example: Java, Spring Boot, MySQL, REST API"
              />
            </label>
          </div>
          {applicants.length === 0 ? (
            <p>No applicants yet.</p>
          ) : (
            applicants.map((applicant) => (
              <div key={applicant.id} className="applicant-card">
                <div className="mini-list-item">
                  <div className="applicant-content">
                    <span>{applicant.userName}</span>
                    <strong>{applicant.userEmail}</strong>
                    <p className="applicant-meta">
                      Applicant ID: {applicant.userId} | Role: {applicant.userRole}
                    </p>
                    <p className="applicant-meta">Applied for: {applicant.jobTitle}</p>
                    <p className="applicant-meta">Resume: {applicant.resumeFileName}</p>
                    <p className="applicant-meta">
                      Status: {applicant.shortlisted ? "Shortlisted" : "Application received"}
                    </p>
                  </div>
                  <div className="applicant-actions">
                    {applicant.resumeUrl ? (
                      <a
                        href={`http://localhost:8081${applicant.resumeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-link"
                      >
                        View Resume
                      </a>
                    ) : (
                      <span className="badge">No Resume</span>
                    )}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleAnalyzeResume(applicant.id)}
                      disabled={analyzingId === applicant.id}
                    >
                      {analyzingId === applicant.id ? "Analyzing..." : "Analyze Resume"}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleSendShortlistEmail(applicant.id)}
                      disabled={sendingEmailId === applicant.id}
                    >
                      {applicant.shortlisted
                        ? "Send Again"
                        : sendingEmailId === applicant.id
                          ? "Sending..."
                          : "Send Shortlist Email"}
                    </button>
                  </div>
                </div>
                {analysisResults[applicant.id] && (
                  <div className="analysis-card">
                    <div className="analysis-score">
                      <span>Match Score</span>
                      <strong>{analysisResults[applicant.id].matchPercentage}%</strong>
                    </div>
                    <p className="applicant-meta">
                      Recommendation: {analysisResults[applicant.id].recommendation}
                    </p>
                    <p className="applicant-meta">{analysisResults[applicant.id].summary}</p>
                    <p className="applicant-meta">
                      Matched: {analysisResults[applicant.id].matchedSkills.join(", ") || "None"}
                    </p>
                    <p className="applicant-meta">
                      Missing: {analysisResults[applicant.id].missingSkills.join(", ") || "None"}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default JobDetails;
