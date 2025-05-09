import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/navigation/Sidebar';
import Header from '@/components/navigation/Header';
import LoadingScreen from '@/components/ui/LoadingScreen';

const DashboardLayout = () => {
  const { isInitialized } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-full bg-dark-500 text-white">
      <Sidebar isOpen={sidebarOpen} isMobile={isMobile} onClose={() => setSidebarOpen(false)} />

      <div className={`flex flex-col flex-1 ${sidebarOpen && !isMobile ? 'lg:ml-64' : ''} transition-all duration-300`}>
        <Header />

        {/* Mobile sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className={`fixed top-20 ${
            sidebarOpen ? 'left-64' : 'left-0'
          } z-40 bg-dark-600 p-2 rounded-r-md lg:hidden`}
        >
          {sidebarOpen ? (
            <ChevronDoubleLeftIcon className="h-5 w-5 text-white" />
          ) : (
            <ChevronDoubleRightIcon className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className={`fixed top-20 ${
            sidebarOpen ? 'left-64' : 'left-0'
          } z-40 bg-dark-600 p-2 rounded-r-md hidden lg:block`}
        >
          {sidebarOpen ? (
            <ChevronDoubleLeftIcon className="h-5 w-5 text-white" />
          ) : (
            <ChevronDoubleRightIcon className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-24">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;