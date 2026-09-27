import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function StudentInterviews() {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    api.get('/student/interviews').then((res) => setInterviews(res.data.interviews));
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Interview Schedule</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Round</th>
              <th>Job</th>
              <th>Company</th>
              <th>Date</th>
              <th>Mode</th>
              <th>Link / Venue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((item) => (
              <tr key={item.id}>
                <td>{item.round_name}</td>
                <td>{item.job_title}</td>
                <td>{item.company_name}</td>
                <td>{new Date(item.interview_date).toLocaleString()}</td>
                <td>{item.mode}</td>
                <td>{item.location_or_link || '-'}</td>
                <td>
                  <span className={`badge status-${item.status}`}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {interviews.length === 0 ? <p className="muted">No interviews scheduled.</p> : null}
      </div>
    </AppLayout>
  );
}
