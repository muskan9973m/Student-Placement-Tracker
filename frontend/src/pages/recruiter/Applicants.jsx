import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function RecruiterApplicants() {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await api.get('/applications');
    setApplications(data.applications);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/applications/${id}/status`, { status });
    setMessage(`Marked as ${status}`);
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Applicants</h2>
      </div>
      {message ? <div className="alert success">{message}</div> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Job</th>
              <th>Branch</th>
              <th>CGPA</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>
                  {app.student_name}
                  <br />
                  <small>{app.student_email}</small>
                </td>
                <td>{app.job_title}</td>
                <td>{app.branch}</td>
                <td>{app.cgpa || '-'}</td>
                <td>
                  <span className={`badge status-${app.status}`}>{app.status}</span>
                </td>
                <td className="actions">
                  <button className="btn btn-light" onClick={() => updateStatus(app.id, 'shortlisted')}>
                    Shortlist
                  </button>
                  <button className="btn btn-light" onClick={() => updateStatus(app.id, 'rejected')}>
                    Reject
                  </button>
                  <button className="btn btn-light" onClick={() => updateStatus(app.id, 'selected')}>
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 ? <p className="muted">No applicants yet.</p> : null}
      </div>
    </AppLayout>
  );
}
