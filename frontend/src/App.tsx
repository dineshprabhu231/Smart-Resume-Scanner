/**
 * App.tsx — React Router configuration with role-based protected routes
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { PageLoader } from './components/shared/Loader';

// Public pages
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// Candidate pages
import CandidateDashboard from './pages/candidate/Dashboard';
import ResumeUpload from './pages/candidate/ResumeUpload';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import JobDescription from './pages/recruiter/JobDescription';
import CandidateAnalysis from './pages/recruiter/CandidateAnalysis';
import Candidates from './pages/recruiter/Candidates';

/** Smart redirect from root — authenticated users go to their dashboard */
function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Landing />;
  return <Navigate to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Candidate routes */}
          <Route element={<ProtectedRoute allowedRole="candidate" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/candidate/upload" element={<ResumeUpload />} />
            </Route>
          </Route>

          {/* Recruiter routes */}
          <Route element={<ProtectedRoute allowedRole="recruiter" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<JobDescription />} />
              <Route path="/recruiter/candidates" element={<Candidates />} />
              <Route path="/recruiter/analysis" element={<CandidateAnalysis />} />
              <Route path="/recruiter/analysis/:resumeId/:jobId" element={<CandidateAnalysis />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
