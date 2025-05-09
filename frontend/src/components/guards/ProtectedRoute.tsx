import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized } = useAuth();

  // If auth is not initialized yet, show loading screen
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected route
  return <Outlet />;
};

export default ProtectedRoute;