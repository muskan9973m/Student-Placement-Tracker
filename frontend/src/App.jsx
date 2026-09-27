import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentJobs from './pages/student/Jobs';
import StudentApplications from './pages/student/Applications';
import StudentDrives from './pages/student/Drives';
import StudentInterviews from './pages/student/Interviews';
import StudentStatistics from './pages/student/Statistics';

import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminRecruiters from './pages/admin/Recruiters';
import AdminCompanies from './pages/admin/Companies';
import AdminJobs from './pages/admin/Jobs';
import AdminApplications from './pages/admin/Applications';
import AdminDrives from './pages/admin/Drives';
import AdminInterviews from './pages/admin/Interviews';
import AdminPlaced from './pages/admin/Placed';
import AdminStatistics from './pages/admin/Statistics';

import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterCompany from './pages/recruiter/Company';
import RecruiterJobs from './pages/recruiter/Jobs';
import RecruiterApplicants from './pages/recruiter/Applicants';
import RecruiterInterviews from './pages/recruiter/Interviews';
import RecruiterSelected from './pages/recruiter/Selected';

function HomeRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!isAuthenticated) return <Landing />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/jobs" element={<ProtectedRoute roles={['student']}><StudentJobs /></ProtectedRoute>} />
          <Route path="/student/applications" element={<ProtectedRoute roles={['student']}><StudentApplications /></ProtectedRoute>} />
          <Route path="/student/drives" element={<ProtectedRoute roles={['student']}><StudentDrives /></ProtectedRoute>} />
          <Route path="/student/interviews" element={<ProtectedRoute roles={['student']}><StudentInterviews /></ProtectedRoute>} />
          <Route path="/student/statistics" element={<ProtectedRoute roles={['student']}><StudentStatistics /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/recruiters" element={<ProtectedRoute roles={['admin']}><AdminRecruiters /></ProtectedRoute>} />
          <Route path="/admin/companies" element={<ProtectedRoute roles={['admin']}><AdminCompanies /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute roles={['admin']}><AdminJobs /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute roles={['admin']}><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/drives" element={<ProtectedRoute roles={['admin']}><AdminDrives /></ProtectedRoute>} />
          <Route path="/admin/interviews" element={<ProtectedRoute roles={['admin']}><AdminInterviews /></ProtectedRoute>} />
          <Route path="/admin/placed" element={<ProtectedRoute roles={['admin']}><AdminPlaced /></ProtectedRoute>} />
          <Route path="/admin/statistics" element={<ProtectedRoute roles={['admin']}><AdminStatistics /></ProtectedRoute>} />

          <Route path="/recruiter/dashboard" element={<ProtectedRoute roles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/recruiter/company" element={<ProtectedRoute roles={['recruiter']}><RecruiterCompany /></ProtectedRoute>} />
          <Route path="/recruiter/jobs" element={<ProtectedRoute roles={['recruiter']}><RecruiterJobs /></ProtectedRoute>} />
          <Route path="/recruiter/applicants" element={<ProtectedRoute roles={['recruiter']}><RecruiterApplicants /></ProtectedRoute>} />
          <Route path="/recruiter/interviews" element={<ProtectedRoute roles={['recruiter']}><RecruiterInterviews /></ProtectedRoute>} />
          <Route path="/recruiter/selected" element={<ProtectedRoute roles={['recruiter']}><RecruiterSelected /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
