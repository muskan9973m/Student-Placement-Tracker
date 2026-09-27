import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallback =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'recruiter'
          ? '/recruiter/dashboard'
          : '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
