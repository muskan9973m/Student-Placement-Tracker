import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async (onlyEligible = eligibleOnly) => {
    const { data } = await api.get(`/student/jobs${onlyEligible ? '?eligible=true' : ''}`);
    setJobs(data.jobs);
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load jobs'));
  }, []);

  const apply = async (jobId) => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post(`/student/jobs/${jobId}/apply`);
      setMessage(data.message);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed');
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h2>Job Openings</h2>
          <p>View and apply to campus job openings.</p>
        </div>
        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={eligibleOnly}
            onChange={(e) => {
              setEligibleOnly(e.target.checked);
              load(e.target.checked);
            }}
          />
          Show eligible only
        </label>
      </div>
      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="cards-list">
        {jobs.map((job) => (
          <article key={job.id} className="job-card">
            <div>
              <h3>{job.title}</h3>
              <p>
                {job.company_name} · {job.location || 'Location TBA'} · {job.job_type}
              </p>
              <p>{job.description}</p>
              <div className="meta-row">
                <span>Package: {job.package_lpa ? `${job.package_lpa} LPA` : 'Not disclosed'}</span>
                <span>Min CGPA: {job.min_cgpa || 0}</span>
                <span>Deadline: {job.application_deadline ? job.application_deadline.slice(0, 10) : 'Open'}</span>
              </div>
              <div className="meta-row">
                <span className={`badge ${job.eligible ? 'ok' : 'warn'}`}>{job.eligible ? 'Eligible' : 'Not eligible'}</span>
                {job.applied ? <span className={`badge status-${job.application_status}`}>{job.application_status}</span> : null}
              </div>
            </div>
            <button className="btn btn-primary" disabled={!job.eligible || job.applied} onClick={() => apply(job.id)}>
              {job.applied ? 'Already Applied' : 'Apply'}
            </button>
          </article>
        ))}
        {jobs.length === 0 ? <p className="muted">No jobs available.</p> : null}
      </div>
    </AppLayout>
  );
}
