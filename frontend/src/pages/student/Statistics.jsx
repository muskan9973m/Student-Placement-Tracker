import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';
import StatCard from '../../components/StatCard';

export default function StudentStatistics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/student/statistics').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <AppLayout>
        <div className="page-loading">Loading statistics...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Placement Statistics</h2>
      </div>
      <div className="stats-grid">
        <StatCard title="Total Students" value={data.overall.total_students} />
        <StatCard title="Placed Students" value={data.overall.placed_students} />
        <StatCard title="Companies" value={data.overall.total_companies} />
        <StatCard title="Open Jobs" value={data.overall.open_jobs} />
        <StatCard title="My Applications" value={data.mine.my_applications || 0} />
        <StatCard title="My Offers" value={data.mine.my_offers || 0} />
      </div>
    </AppLayout>
  );
}
