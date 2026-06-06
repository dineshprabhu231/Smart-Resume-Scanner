/** Protected route — redirects unauthenticated users to /signin */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../shared/Loader';

interface ProtectedRouteProps {
  allowedRole?: 'recruiter' | 'candidate';
}

export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace />;
  }

  return <Outlet />;
}
