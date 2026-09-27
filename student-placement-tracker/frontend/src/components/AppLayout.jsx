import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menus = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/profile', label: 'Profile' },
    { to: '/student/jobs', label: 'Jobs' },
    { to: '/student/applications', label: 'Applications' },
    { to: '/student/drives', label: 'Drives' },
    { to: '/student/interviews', label: 'Interviews' },
    { to: '/student/statistics', label: 'Statistics' }
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/recruiters', label: 'Recruiters' },
    { to: '/admin/companies', label: 'Companies' },
    { to: '/admin/jobs', label: 'Jobs' },
    { to: '/admin/applications', label: 'Applications' },
    { to: '/admin/drives', label: 'Drives' },
    { to: '/admin/interviews', label: 'Interviews' },
    { to: '/admin/placed', label: 'Placed' },
    { to: '/admin/statistics', label: 'Statistics' }
  ],
  recruiter: [
    { to: '/recruiter/dashboard', label: 'Dashboard' },
    { to: '/recruiter/company', label: 'Company' },
    { to: '/recruiter/jobs', label: 'Jobs' },
    { to: '/recruiter/applicants', label: 'Applicants' },
    { to: '/recruiter/interviews', label: 'Interviews' },
    { to: '/recruiter/selected', label: 'Selected' }
  ]
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = menus[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">SPT</span>
          <div>
            <strong>Placement Tracker</strong>
            <p>{user?.role}</p>
          </div>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn btn-light logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Welcome, {user?.full_name}</h1>
            <p>{user?.email}</p>
          </div>
        </header>
        <div className="content-area">{children}</div>
      </main>
    </div>
  );
}
