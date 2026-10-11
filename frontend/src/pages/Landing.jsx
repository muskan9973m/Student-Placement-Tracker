import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-hero">
        <p className="eyebrow">College Placement System</p>
        <h1>Student Placement Tracker</h1>
        <p className="lead">
          Manage student profiles, job openings, applications, interviews and placement drives in one place.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/login">
            Login
          </Link>
          <Link className="btn btn-secondary" to="/register">
            Register
          </Link>
        </div>
      </div>
      <div className="landing-panel">
        <h2>Built for campus placements</h2>
        <ul>
          <li>Students complete profiles and apply to eligible jobs</li>
          <li>Admins manage companies, drives and placement stats</li>
          <li>Recruiters review applicants and schedule interviews</li>
        </ul>
      </div>
    </div>
  );
}
