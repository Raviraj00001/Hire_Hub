import { Link, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobsList from "./pages/JobsList";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";

function App() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("hirehubUser"));

  const handleLogout = () => {
    localStorage.removeItem("hirehubUser");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <div className="background-orb orb-one"></div>
      <div className="background-orb orb-two"></div>

      <nav className="navbar">
        <div className="brand-group">
          <Link to="/" className="brand">
            <span className="brand-mark">H</span>
            <span>
              HireHub
              <small>Simple hiring, cleaner workflow</small>
            </span>
          </Link>
        </div>

        <div className="nav-links">
          {user ? (
            <>
              <Link to="/" className="nav-pill">
                Jobs
              </Link>
              {user.role === "EMPLOYER" && (
                <Link to="/post-job" className="nav-pill">
                  Post Job
                </Link>
              )}
              <div className="nav-user">
                <span>{user.name}</span>
                <small>{user.role.replace("_", " ")}</small>
              </div>
              <button onClick={handleLogout} className="ghost-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-pill">
                Login
              </Link>
              <Link to="/register" className="solid-button">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="page-container">
        <Routes>
          <Route path="/" element={<JobsList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/post-job" element={<PostJob />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
