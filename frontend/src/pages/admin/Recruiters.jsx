import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

const empty = { full_name: '', email: '', password: '', phone: '', company_id: '', designation: '' };

export default function AdminRecruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [r, c] = await Promise.all([api.get('/admin/recruiters'), api.get('/companies')]);
    setRecruiters(r.data.recruiters);
    setCompanies(c.data.companies);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/admin/recruiters', {
      ...form,
      company_id: form.company_id ? Number(form.company_id) : null
    });
    setForm(empty);
    setMessage('Recruiter created');
    load();
  };

  const toggle = async (id) => {
    await api.patch(`/admin/recruiters/${id}/toggle-active`);
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Manage Recruiters</h2>
      </div>
      {message ? <div className="alert success">{message}</div> : null}

      <section className="panel">
        <h3>Add Recruiter</h3>
        <form className="grid-2" onSubmit={create}>
          <label>
            Full name
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>
            Company
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Designation
            <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            Create Recruiter
          </button>
        </form>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recruiters.map((r) => (
              <tr key={r.id}>
                <td>{r.full_name}</td>
                <td>{r.email}</td>
                <td>{r.company_name || '-'}</td>
                <td>{r.designation || '-'}</td>
                <td>{r.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                  <button className="btn btn-light" onClick={() => toggle(r.id)}>
                    {r.is_active ? 'Deactivate' : 'Activate'}
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
