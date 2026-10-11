import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function AdminPlaced() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get('/admin/students/placed').then((res) => setStudents(res.data.placed_students));
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Placed Students</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Company</th>
              <th>Job</th>
              <th>Package</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={`${s.email}-${idx}`}>
                <td>{s.full_name}</td>
                <td>{s.email}</td>
                <td>{s.branch}</td>
                <td>{s.company_name}</td>
                <td>{s.job_title}</td>
                <td>{s.package_lpa || '-'}</td>
                <td>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 ? <p className="muted">No placed students yet.</p> : null}
      </div>
    </AppLayout>
  );
}
