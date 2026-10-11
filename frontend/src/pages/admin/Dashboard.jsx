import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';
import StatCard from '../../components/StatCard';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <AppLayout>
        <div className="page-loading">Loading...</div>
      </AppLayout>
    );
  }

  const s = data.stats;
  return (
    <AppLayout>
      <div className="page-header">
        <h2>Admin Dashboard</h2>
      </div>
      <div className="stats-grid">
        <StatCard title="Students" value={s.total_students} />
        <StatCard title="Recruiters" value={s.total_recruiters} />
        <StatCard title="Companies" value={s.total_companies} />
        <StatCard title="Jobs" value={s.total_jobs} />
        <StatCard title="Open Jobs" value={s.open_jobs} />
        <StatCard title="Applications" value={s.total_applications} />
        <StatCard title="Placed" value={s.placed_students} />
        <StatCard title="Upcoming Drives" value={s.upcoming_drives} />
      </div>
      <section className="panel">
        <h3>Recent Applications</h3>
        <ul className="list">
          {data.recent_applications.map((app) => (
            <li key={app.id}>
              <strong>{app.student_name}</strong> applied for {app.job_title} at {app.company_name}
              <span className={`badge status-${app.status}`}>{app.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppLayout>
  );
}
