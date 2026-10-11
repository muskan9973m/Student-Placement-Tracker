import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';
import StatCard from '../../components/StatCard';

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/recruiter/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <AppLayout>
        <div className="page-loading">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h2>Recruiter Dashboard</h2>
          <p>{data.company?.name || 'Complete your company profile to post jobs'}</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard title="Jobs" value={data.stats.total_jobs} />
        <StatCard title="Open Jobs" value={data.stats.open_jobs} />
        <StatCard title="Applicants" value={data.stats.total_applicants} />
        <StatCard title="Shortlisted" value={data.stats.shortlisted} />
        <StatCard title="Selected" value={data.stats.selected} />
        <StatCard title="Interviews" value={data.stats.interviews} />
      </div>
      <section className="panel">
        <h3>Recent Applicants</h3>
        <ul className="list">
          {data.recent_applicants.map((a) => (
            <li key={a.id}>
              <strong>{a.student_name}</strong> for {a.job_title}
              <span className={`badge status-${a.status}`}>{a.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppLayout>
  );
}
