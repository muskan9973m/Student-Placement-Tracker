import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

const empty = {
  name: '',
  website: '',
  description: '',
  location: '',
  industry: '',
  company_size: ''
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [logo, setLogo] = useState(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await api.get('/companies');
    setCompanies(data.companies);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v || ''));
    if (logo) formData.append('logo', logo);

    if (editId) {
      await api.put(`/companies/${editId}`, formData);
      setMessage('Company updated');
    } else {
      await api.post('/companies', formData);
      setMessage('Company created');
    }
    setForm(empty);
    setEditId(null);
    setLogo(null);
    load();
  };

  const startEdit = (company) => {
    setEditId(company.id);
    setForm({
      name: company.name || '',
      website: company.website || '',
      description: company.description || '',
      location: company.location || '',
      industry: company.industry || '',
      company_size: company.company_size || ''
    });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    await api.delete(`/companies/${id}`);
    setMessage('Company deleted');
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Manage Companies</h2>
      </div>
      {message ? <div className="alert success">{message}</div> : null}

      <section className="panel">
        <h3>{editId ? 'Edit Company' : 'Add Company'}</h3>
        <form className="grid-2" onSubmit={submit}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Website
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </label>
          <label>
            Location
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <label>
            Industry
            <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </label>
          <label>
            Company size
            <input value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} />
          </label>
          <label>
            Logo
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
          </label>
          <label className="full">
            Description
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            {editId ? 'Update Company' : 'Add Company'}
          </button>
          {editId ? (
            <button
              className="btn btn-light"
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(empty);
              }}
            >
              Cancel
            </button>
          ) : null}
        </form>
      </section>

      <div className="cards-list">
        {companies.map((c) => (
          <article key={c.id} className="job-card">
            <div>
              <h3>{c.name}</h3>
              <p>
                {c.industry || 'Industry N/A'} · {c.location || 'Location N/A'} · {c.jobs_count} jobs
              </p>
              <p>{c.description}</p>
              {c.website ? (
                <a href={c.website} target="_blank" rel="noreferrer">
                  Website
                </a>
              ) : null}
            </div>
            <div className="actions">
              <button className="btn btn-light" onClick={() => startEdit(c)}>
                Edit
              </button>
              <button className="btn btn-light" onClick={() => remove(c.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppLayout>
  );
}
