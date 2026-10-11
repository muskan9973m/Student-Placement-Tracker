import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function StudentDrives() {
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    api.get('/student/drives').then((res) => setDrives(res.data.drives));
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Placement Drives</h2>
      </div>
      <div className="cards-list">
        {drives.map((drive) => (
          <article key={drive.id} className="job-card">
            <div>
              <h3>{drive.title}</h3>
              <p>
                {drive.company_name} · {drive.venue || 'Venue TBA'}
              </p>
              <p>{drive.description}</p>
              <div className="meta-row">
                <span>Date: {drive.drive_date ? drive.drive_date.slice(0, 10) : 'TBA'}</span>
                <span>Min CGPA: {drive.min_cgpa || 0}</span>
                <span className={`badge status-${drive.status}`}>{drive.status}</span>
              </div>
            </div>
          </article>
        ))}
        {drives.length === 0 ? <p className="muted">No placement drives listed.</p> : null}
      </div>
    </AppLayout>
  );
}
