import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

const empty = {
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

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/jobs');
    setJobs(data.jobs);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/jobs', {
        ...form,
        package_lpa: form.package_lpa ? Number(form.package_lpa) : null,
        openings: Number(form.openings || 1),
        min_cgpa: Number(form.min_cgpa || 0)
      });
      setForm(empty);
      setMessage('Job created');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    }
  };

  const closeJob = async (id) => {
    await api.put(`/jobs/${id}`, { status: 'closed' });
    load();
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h2>My Job Openings</h2>
      </div>
      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <section className="panel">
        <h3>Create Job Opening</h3>
        <form className="grid-2" onSubmit={submit}>
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Location
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <label className="full">
            Description
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
          <label>
            Required skills
            <input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} />
          </label>
          <label>
            Deadline
            <input type="date" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            Create Job
          </button>
        </form>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Package</th>
              <th>Applicants</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.package_lpa || '-'}</td>
                <td>{job.applicants_count}</td>
                <td>{job.status}</td>
                <td>
                  {job.status === 'open' ? (
                    <button className="btn btn-light" onClick={() => closeJob(job.id)}>
                      Close
                    </button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
