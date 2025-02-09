import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowGuest?: boolean;
}

const ProtectedRoute = ({ children, allowGuest = true }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  console.log('user', user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || (!allowGuest && user.isGuest)) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 