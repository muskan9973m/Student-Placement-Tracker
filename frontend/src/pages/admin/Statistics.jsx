import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';
import StatCard from '../../components/StatCard';

export default function AdminStatistics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/statistics').then((res) => setData(res.data));
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
        <h2>Placement Statistics</h2>
      </div>
      <div className="stats-grid">
        <StatCard title="Total Students" value={data.stats.total_students} />
        <StatCard title="Placed Students" value={data.stats.placed_students} />
        <StatCard title="Selected Apps" value={data.stats.selected_applications} />
        <StatCard title="Total Jobs" value={data.stats.total_jobs} />
        <StatCard title="Avg Package" value={data.stats.avg_package ? Number(data.stats.avg_package).toFixed(2) : '-'} />
      </div>

      <div className="panels-grid">
        <section className="panel">
          <h3>By Branch</h3>
          <ul className="list">
            {data.by_branch.map((row) => (
              <li key={row.branch}>
                <strong>{row.branch}</strong>
                <span>
                  {row.placed}/{row.total} placed
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h3>By Company</h3>
          <ul className="list">
            {data.by_company.map((row) => (
              <li key={row.company_name}>
                <strong>{row.company_name}</strong>
                <span>
                  {row.selected || 0} selected / {row.applications || 0} apps
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
