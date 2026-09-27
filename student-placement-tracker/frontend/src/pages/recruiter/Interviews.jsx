import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function RecruiterInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({
    application_id: '',
    round_name: '',
    interview_date: '',
    mode: 'online',
    location_or_link: ''
  });
  const [message, setMessage] = useState('');

  const load = async () => {
    const [i, a] = await Promise.all([api.get('/interviews'), api.get('/applications')]);
    setInterviews(i.data.interviews);
    setApplications(a.data.applications);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/interviews', { ...form, application_id: Number(form.application_id) });
    setMessage('Interview scheduled');
    setForm({ application_id: '', round_name: '', interview_date: '', mode: 'online', location_or_link: '' });
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Interview Rounds</h2>
      </div>
      {message ? <div className="alert success">{message}</div> : null}
      <section className="panel">
        <form className="grid-2" onSubmit={submit}>
          <label>
            Applicant
            <select value={form.application_id} onChange={(e) => setForm({ ...form, application_id: e.target.value })} required>
              <option value="">Select</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.student_name} - {app.job_title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Round
            <input value={form.round_name} onChange={(e) => setForm({ ...form, round_name: e.target.value })} required />
          </label>
          <label>
            Date & time
            <input type="datetime-local" value={form.interview_date} onChange={(e) => setForm({ ...form, interview_date: e.target.value })} required />
          </label>
          <label>
            Mode
            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </label>
          <label className="full">
            Link / Venue
            <input value={form.location_or_link} onChange={(e) => setForm({ ...form, location_or_link: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            Schedule Round
          </button>
        </form>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Job</th>
              <th>Round</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((item) => (
              <tr key={item.id}>
                <td>{item.student_name}</td>
                <td>{item.job_title}</td>
                <td>{item.round_name}</td>
                <td>{new Date(item.interview_date).toLocaleString()}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
