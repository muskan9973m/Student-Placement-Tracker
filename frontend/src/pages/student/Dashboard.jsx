import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';
import StatCard from '../../components/StatCard';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/student/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) {
    return (
      <AppLayout>
        <div className="alert error">{error}</div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="page-loading">Loading dashboard...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h2>{data.student_name}'s Dashboard</h2>
          <p>Track your placement progress in one place.</p>
        </div>
        <Link className="btn btn-primary" to="/student/profile">
          Complete Profile
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard title="Profile Completion" value={`${data.profile_completion}%`} hint={data.resume_uploaded ? 'Resume uploaded' : 'Resume missing'} />
        <StatCard title="Applications" value={data.stats.applications} />
        <StatCard title="Shortlisted" value={data.stats.shortlisted} />
        <StatCard title="Interviews" value={data.stats.interviews} />
        <StatCard title="Offers" value={data.stats.offers} />
      </div>

      <div className="panels-grid">
        <section className="panel">
          <h3>Recent Applications</h3>
          {data.recent_applications.length === 0 ? (
            <p className="muted">No applications yet.</p>
          ) : (
            <ul className="list">
              {data.recent_applications.map((app) => (
                <li key={app.id}>
                  <strong>{app.job_title}</strong> at {app.company_name}
                  <span className={`badge status-${app.status}`}>{app.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h3>Upcoming Interviews</h3>
          {data.upcoming_interviews.length === 0 ? (
            <p className="muted">No interviews scheduled.</p>
          ) : (
            <ul className="list">
              {data.upcoming_interviews.map((item) => (
                <li key={item.id}>
                  <strong>{item.round_name}</strong> - {item.job_title} ({item.company_name})
                  <span>{new Date(item.interview_date).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h3>Eligible Jobs</h3>
          {data.eligible_jobs.length === 0 ? (
            <p className="muted">No eligible jobs right now.</p>
          ) : (
            <ul className="list">
              {data.eligible_jobs.map((job) => (
                <li key={job.id}>
                  <strong>{job.title}</strong> at {job.company_name}
                  <Link to="/student/jobs">View</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h3>Upcoming Drives</h3>
          {data.upcoming_drives.length === 0 ? (
            <p className="muted">No upcoming drives.</p>
          ) : (
            <ul className="list">
              {data.upcoming_drives.map((drive) => (
                <li key={drive.id}>
                  <strong>{drive.title}</strong> - {drive.company_name}
                  <span>{drive.drive_date ? new Date(drive.drive_date).toLocaleDateString() : 'TBA'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
