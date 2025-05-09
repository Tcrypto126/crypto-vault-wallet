import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

const GuestRoute = () => {
  const { isAuthenticated, isInitialized } = useAuth();

  // If auth is not initialized yet, show loading screen
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the guest route
  return <Outlet />;
};

export default GuestRoute;