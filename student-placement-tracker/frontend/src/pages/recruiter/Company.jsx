import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function RecruiterCompany() {
  const [form, setForm] = useState({
    name: '',
    website: '',
    description: '',
    location: '',
    industry: '',
    company_size: '',
    designation: ''
  });
  const [logo, setLogo] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/recruiter/company').then((res) => {
      if (res.data.company) {
        setForm({
          name: res.data.company.name || '',
          website: res.data.company.website || '',
          description: res.data.company.description || '',
          location: res.data.company.location || '',
          industry: res.data.company.industry || '',
          company_size: res.data.company.company_size || '',
          designation: res.data.designation || ''
        });
      }
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v || ''));
    if (logo) formData.append('logo', logo);
    await api.put('/recruiter/company', formData);
    setMessage('Company profile saved');
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Company Profile</h2>
      </div>
      {message ? <div className="alert success">{message}</div> : null}
      <section className="panel">
        <form className="grid-2" onSubmit={submit}>
          <label>
            Company name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Your designation
            <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
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
            Save Company Profile
          </button>
        </form>
      </section>
    </AppLayout>
  );
}
