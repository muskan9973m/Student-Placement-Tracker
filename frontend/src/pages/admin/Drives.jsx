import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

const empty = {
  company_id: '',
  title: '',
  description: '',
  drive_date: '',
  venue: '',
  min_cgpa: 0,
  allowed_branches: '',
  graduation_years: '',
  status: 'upcoming'
};

export default function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [d, c] = await Promise.all([api.get('/drives'), api.get('/companies')]);
    setDrives(d.data.drives);
    setCompanies(c.data.companies);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/drives', {
      ...form,
      company_id: Number(form.company_id),
      min_cgpa: Number(form.min_cgpa || 0)
    });
    setForm(empty);
    setMessage('Drive created');
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/drives/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete drive?')) return;
    await api.delete(`/drives/${id}`);
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Placement Drives</h2>
      </div>
      {message ? <div className="alert success">{message}</div> : null}

      <section className="panel">
        <h3>Create Drive</h3>
        <form className="grid-2" onSubmit={submit}>
          <label>
            Company
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} required>
              <option value="">Select</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="full">
            Description
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label>
            Date
            <input type="date" value={form.drive_date} onChange={(e) => setForm({ ...form, drive_date: e.target.value })} />
          </label>
          <label>
            Venue
            <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </label>
          <label>
            Min CGPA
            <input type="number" step="0.01" value={form.min_cgpa} onChange={(e) => setForm({ ...form, min_cgpa: e.target.value })} />
          </label>
          <label>
            Allowed branches
            <input value={form.allowed_branches} onChange={(e) => setForm({ ...form, allowed_branches: e.target.value })} />
          </label>
          <label>
            Graduation years
            <input value={form.graduation_years} onChange={(e) => setForm({ ...form, graduation_years: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            Create Drive
          </button>
        </form>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drives.map((d) => (
              <tr key={d.id}>
                <td>{d.title}</td>
                <td>{d.company_name}</td>
                <td>{d.drive_date ? d.drive_date.slice(0, 10) : '-'}</td>
                <td>
                  <select value={d.status} onChange={(e) => updateStatus(d.id, e.target.value)}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <button className="btn btn-light" onClick={() => remove(d.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
