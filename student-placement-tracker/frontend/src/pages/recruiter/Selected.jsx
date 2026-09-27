import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function RecruiterSelected() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get('/recruiter/selected-students').then((res) => setStudents(res.data.selected_students));
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Selected Students</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>CGPA</th>
              <th>Job</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={`${s.email}-${idx}`}>
                <td>{s.full_name}</td>
                <td>{s.email}</td>
                <td>{s.branch}</td>
                <td>{s.cgpa || '-'}</td>
                <td>{s.job_title}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 ? <p className="muted">No selected students yet.</p> : null}
      </div>
    </AppLayout>
  );
}
