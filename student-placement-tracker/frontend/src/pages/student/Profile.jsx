import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AppLayout from '../../components/AppLayout';

const emptyProject = { title: '', description: '', technologies: '', github_url: '', live_url: '' };
const emptyCert = { certificate_name: '', issuing_organization: '', issue_date: '' };

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [completion, setCompletion] = useState(0);
  const [personal, setPersonal] = useState({});
  const [academic, setAcademic] = useState({});
  const [skillName, setSkillName] = useState('');
  const [project, setProject] = useState(emptyProject);
  const [cert, setCert] = useState(emptyCert);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const load = async () => {
    const { data } = await api.get('/student/profile');
    setProfile(data.profile);
    setSkills(data.skills);
    setProjects(data.projects);
    setCertifications(data.certifications);
    setCompletion(data.profile_completion);
    setPersonal({
      full_name: data.profile.full_name || '',
      phone: data.profile.phone || '',
      date_of_birth: data.profile.date_of_birth ? data.profile.date_of_birth.slice(0, 10) : '',
      address: data.profile.address || ''
    });
    setAcademic({
      college: data.profile.college || '',
      degree: data.profile.degree || '',
      course: data.profile.course || '',
      branch: data.profile.branch || '',
      graduation_year: data.profile.graduation_year || '',
      cgpa: data.profile.cgpa || '',
      class10_percentage: data.profile.class10_percentage || '',
      class12_percentage: data.profile.class12_percentage || ''
    });
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load profile'));
  }, []);

  const flash = (msg) => {
    setMessage(msg);
    setError('');
    setTimeout(() => setMessage(''), 2500);
  };

  const savePersonal = async (e) => {
    e.preventDefault();
    await api.put('/student/profile/personal', personal);
    flash('Personal information saved');
    load();
  };

  const saveAcademic = async (e) => {
    e.preventDefault();
    await api.put('/student/profile/academic', academic);
    flash('Academic information saved');
    load();
  };

  const addSkill = async (e) => {
    e.preventDefault();
    await api.post('/student/skills', { skill_name: skillName });
    setSkillName('');
    flash('Skill added');
    load();
  };

  const removeSkill = async (id) => {
    await api.delete(`/student/skills/${id}`);
    flash('Skill removed');
    load();
  };

  const addProject = async (e) => {
    e.preventDefault();
    await api.post('/student/projects', project);
    setProject(emptyProject);
    flash('Project added');
    load();
  };

  const removeProject = async (id) => {
    await api.delete(`/student/projects/${id}`);
    flash('Project removed');
    load();
  };

  const addCert = async (e) => {
    e.preventDefault();
    await api.post('/student/certifications', cert);
    setCert(emptyCert);
    flash('Certification added');
    load();
  };

  const removeCert = async (id) => {
    await api.delete(`/student/certifications/${id}`);
    flash('Certification removed');
    load();
  };

  const uploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Choose a resume file first');
      return;
    }
    const formData = new FormData();
    formData.append('resume', resumeFile);
    await api.post('/student/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setResumeFile(null);
    flash('Resume uploaded');
    load();
  };

  if (!profile) {
    return (
      <AppLayout>
        <div className="page-loading">Loading profile...</div>
      </AppLayout>
    );
  }

  const resumeUrl = profile.resume_path
    ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${profile.resume_path}`
    : null;

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h2>Student Profile</h2>
          <p>Profile completion: {completion}%</p>
        </div>
      </div>
      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="progress-bar">
        <div style={{ width: `${completion}%` }} />
      </div>

      <section className="panel">
        <h3>Personal Information</h3>
        <form className="grid-2" onSubmit={savePersonal}>
          <label>
            Name
            <input value={personal.full_name} onChange={(e) => setPersonal({ ...personal, full_name: e.target.value })} required />
          </label>
          <label>
            Email
            <input value={profile.email} disabled />
          </label>
          <label>
            Phone
            <input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} />
          </label>
          <label>
            Date of birth
            <input type="date" value={personal.date_of_birth} onChange={(e) => setPersonal({ ...personal, date_of_birth: e.target.value })} />
          </label>
          <label className="full">
            Address
            <textarea value={personal.address} onChange={(e) => setPersonal({ ...personal, address: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            Save Personal Info
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Academic Information</h3>
        <form className="grid-2" onSubmit={saveAcademic}>
          <label>
            College
            <input value={academic.college} onChange={(e) => setAcademic({ ...academic, college: e.target.value })} />
          </label>
          <label>
            Degree
            <input value={academic.degree} onChange={(e) => setAcademic({ ...academic, degree: e.target.value })} />
          </label>
          <label>
            Course
            <input value={academic.course} onChange={(e) => setAcademic({ ...academic, course: e.target.value })} />
          </label>
          <label>
            Branch
            <input value={academic.branch} onChange={(e) => setAcademic({ ...academic, branch: e.target.value })} />
          </label>
          <label>
            Graduation year
            <input type="number" value={academic.graduation_year} onChange={(e) => setAcademic({ ...academic, graduation_year: e.target.value })} />
          </label>
          <label>
            CGPA
            <input type="number" step="0.01" value={academic.cgpa} onChange={(e) => setAcademic({ ...academic, cgpa: e.target.value })} />
          </label>
          <label>
            Class 10 %
            <input type="number" step="0.01" value={academic.class10_percentage} onChange={(e) => setAcademic({ ...academic, class10_percentage: e.target.value })} />
          </label>
          <label>
            Class 12 %
            <input type="number" step="0.01" value={academic.class12_percentage} onChange={(e) => setAcademic({ ...academic, class12_percentage: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            Save Academic Info
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Skills</h3>
        <div className="chips">
          {skills.map((s) => (
            <span key={s.id} className="chip">
              {s.skill_name}
              <button type="button" onClick={() => removeSkill(s.id)}>
                x
              </button>
            </span>
          ))}
        </div>
        <form className="inline-form" onSubmit={addSkill}>
          <input placeholder="Add skill (e.g. React)" value={skillName} onChange={(e) => setSkillName(e.target.value)} required />
          <button className="btn btn-primary" type="submit">
            Add Skill
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Projects</h3>
        <ul className="list">
          {projects.map((p) => (
            <li key={p.id}>
              <div>
                <strong>{p.title}</strong>
                <p>{p.description}</p>
                <small>{p.technologies}</small>
              </div>
              <button className="btn btn-light" type="button" onClick={() => removeProject(p.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
        <form className="grid-2" onSubmit={addProject}>
          <label>
            Title
            <input value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} required />
          </label>
          <label>
            Technologies
            <input value={project.technologies} onChange={(e) => setProject({ ...project, technologies: e.target.value })} />
          </label>
          <label className="full">
            Description
            <textarea value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} />
          </label>
          <label>
            GitHub URL
            <input value={project.github_url} onChange={(e) => setProject({ ...project, github_url: e.target.value })} />
          </label>
          <label>
            Live URL
            <input value={project.live_url} onChange={(e) => setProject({ ...project, live_url: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            Add Project
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Certifications</h3>
        <ul className="list">
          {certifications.map((c) => (
            <li key={c.id}>
              <div>
                <strong>{c.certificate_name}</strong>
                <p>
                  {c.issuing_organization} {c.issue_date ? `- ${c.issue_date.slice(0, 10)}` : ''}
                </p>
              </div>
              <button className="btn btn-light" type="button" onClick={() => removeCert(c.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
        <form className="grid-2" onSubmit={addCert}>
          <label>
            Certificate name
            <input value={cert.certificate_name} onChange={(e) => setCert({ ...cert, certificate_name: e.target.value })} required />
          </label>
          <label>
            Issuing organization
            <input value={cert.issuing_organization} onChange={(e) => setCert({ ...cert, issuing_organization: e.target.value })} />
          </label>
          <label>
            Date
            <input type="date" value={cert.issue_date} onChange={(e) => setCert({ ...cert, issue_date: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            Add Certification
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Resume</h3>
        {resumeUrl ? (
          <p>
            Current resume:{' '}
            <a href={resumeUrl} target="_blank" rel="noreferrer">
              View / Download
            </a>
          </p>
        ) : (
          <p className="muted">No resume uploaded yet.</p>
        )}
        <form className="inline-form" onSubmit={uploadResume}>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} />
          <button className="btn btn-primary" type="submit">
            {profile.resume_path ? 'Replace Resume' : 'Upload Resume'}
          </button>
        </form>
      </section>
    </AppLayout>
  );
}
