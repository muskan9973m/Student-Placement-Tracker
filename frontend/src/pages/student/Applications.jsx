import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get('/student/applications').then((res) => setApplications(res.data.applications));
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <h2>My Applications</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Package</th>
              <th>Status</th>
              <th>Applied On</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.job_title}</td>
                <td>{app.company_name}</td>
                <td>{app.package_lpa ? `${app.package_lpa} LPA` : '-'}</td>
                <td>
                  <span className={`badge status-${app.status}`}>{app.status}</span>
                </td>
                <td>{new Date(app.applied_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 ? <p className="muted">No applications yet.</p> : null}
      </div>
    </AppLayout>
  );
}
