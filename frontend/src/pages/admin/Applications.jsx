import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const query = statusFilter ? `?status=${statusFilter}` : '';
    const { data } = await api.get(`/applications${query}`);
    setApplications(data.applications);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/applications/${id}/status`, { status });
    setMessage('Status updated');
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Applications</h2>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="interview">Interview</option>
            <option value="selected">Selected</option>
            <option value="offer">Offer</option>
          </select>
          <button className="btn btn-primary" type="submit">
            Filter
          </button>
        </form>
      </div>
      {message ? <div className="alert success">{message}</div> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Job</th>
              <th>Company</th>
              <th>CGPA</th>
              <th>Status</th>
              <th>Change Status</th>
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
                <td>{app.company_name}</td>
                <td>{app.cgpa || '-'}</td>
                <td>
                  <span className={`badge status-${app.status}`}>{app.status}</span>
                </td>
                <td>
                  <select defaultValue={app.status} onChange={(e) => updateStatus(app.id, e.target.value)}>
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="interview">Interview</option>
                    <option value="selected">Selected</option>
                    <option value="offer">Offer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
