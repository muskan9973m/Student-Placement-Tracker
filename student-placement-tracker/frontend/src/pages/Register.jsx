import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initial = {
  full_name: '',
  email: '',
  password: '',
  confirm_password: '',
  phone: '',
  college: '',
  course: '',
  branch: '',
  graduation_year: '',
  role: 'student',
  company_name: '',
  designation: ''
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, graduation_year: form.graduation_year ? Number(form.graduation_year) : null };
      const user = await register(payload);
      if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page wide">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Register</h1>
        <p>Students and recruiters can create accounts. Admin is seeded separately.</p>
        {error ? <div className="alert error">{error}</div> : null}

        <div className="grid-2">
          <label>
            Full name
            <input name="full_name" value={form.full_name} onChange={onChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={onChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={onChange} required />
          </label>
          <label>
            Confirm password
            <input type="password" name="confirm_password" value={form.confirm_password} onChange={onChange} required />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={onChange} />
          </label>
          <label>
            Role
            <select name="role" value={form.role} onChange={onChange}>
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </label>
        </div>

        {form.role === 'student' ? (
          <div className="grid-2">
            <label>
              College / University
              <input name="college" value={form.college} onChange={onChange} required />
            </label>
            <label>
              Course
              <input name="course" value={form.course} onChange={onChange} required />
            </label>
            <label>
              Branch
              <input name="branch" value={form.branch} onChange={onChange} required />
            </label>
            <label>
              Graduation year
              <input type="number" name="graduation_year" value={form.graduation_year} onChange={onChange} required />
            </label>
          </div>
        ) : (
          <div className="grid-2">
            <label>
              Company name
              <input name="company_name" value={form.company_name} onChange={onChange} required />
            </label>
            <label>
              Designation
              <input name="designation" value={form.designation} onChange={onChange} />
            </label>
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <div className="auth-links">
          <Link to="/login">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}
