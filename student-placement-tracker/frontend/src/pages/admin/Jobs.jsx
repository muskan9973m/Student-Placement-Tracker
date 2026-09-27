import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

const empty = {
  company_id: '',
  title: '',
  description: '',
  location: '',
  job_type: 'full-time',
  package_lpa: '',
  openings: 1,
  min_cgpa: 0,
  allowed_branches: '',
  graduation_years: '',
  required_skills: '',
  application_deadline: '',
  status: 'open'
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [j, c] = await Promise.all([api.get('/jobs'), api.get('/companies')]);
    setJobs(j.data.jobs);
    setCompanies(c.data.companies);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      company_id: Number(form.company_id),
      package_lpa: form.package_lpa ? Number(form.package_lpa) : null,
      openings: Number(form.openings || 1),
      min_cgpa: Number(form.min_cgpa || 0)
    };
    if (editId) {
      await api.put(`/jobs/${editId}`, payload);
      setMessage('Job updated');
    } else {
      await api.post('/jobs', payload);
      setMessage('Job created');
    }
    setForm(empty);
    setEditId(null);
    load();
  };

  const startEdit = (job) => {
    setEditId(job.id);
    setForm({
      company_id: String(job.company_id),
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      job_type: job.job_type || 'full-time',
      package_lpa: job.package_lpa || '',
      openings: job.openings || 1,
      min_cgpa: job.min_cgpa || 0,
      allowed_branches: job.allowed_branches || '',
      graduation_years: job.graduation_years || '',
      required_skills: job.required_skills || '',
      application_deadline: job.application_deadline ? job.application_deadline.slice(0, 10) : '',
      status: job.status || 'open'
    });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await api.delete(`/jobs/${id}`);
    setMessage('Job deleted');
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>Job Postings</h2>
      </div>
      {message ? <div className="alert success">{message}</div> : null}

      <section className="panel">
        <h3>{editId ? 'Edit Job' : 'Create Job'}</h3>
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
            Location
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <label>
            Job type
            <select value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })}>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="part-time">Part-time</option>
            </select>
          </label>
          <label>
            Package (LPA)
            <input type="number" step="0.01" value={form.package_lpa} onChange={(e) => setForm({ ...form, package_lpa: e.target.value })} />
          </label>
          <label>
            Openings
            <input type="number" value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} />
          </label>
          <label>
            Min CGPA
            <input type="number" step="0.01" value={form.min_cgpa} onChange={(e) => setForm({ ...form, min_cgpa: e.target.value })} />
          </label>
          <label>
            Allowed branches (comma separated)
            <input value={form.allowed_branches} onChange={(e) => setForm({ ...form, allowed_branches: e.target.value })} placeholder="CSE, IT" />
          </label>
          <label>
            Graduation years (comma separated)
            <input value={form.graduation_years} onChange={(e) => setForm({ ...form, graduation_years: e.target.value })} placeholder="2026, 2027" />
          </label>
          <label>
            Required skills
            <input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} />
          </label>
          <label>
            Deadline
            <input type="date" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <button className="btn btn-primary" type="submit">
            {editId ? 'Update Job' : 'Create Job'}
          </button>
        </form>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Package</th>
              <th>Applicants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.company_name}</td>
                <td>{job.package_lpa || '-'}</td>
                <td>{job.applicants_count}</td>
                <td>{job.status}</td>
                <td className="actions">
                  <button className="btn btn-light" onClick={() => startEdit(job)}>
                    Edit
                  </button>
                  <button className="btn btn-light" onClick={() => remove(job.id)}>
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
