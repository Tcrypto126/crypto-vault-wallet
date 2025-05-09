import { useNavigate, NavLink } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  GiftIcon,
  UserIcon,
  Cog8ToothIcon,
} from '@heroicons/react/24/outline';
import { WalletIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, isMobile, onClose }: SidebarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Transactions', href: '/transactions', icon: ArrowPathIcon },
    { name: 'Transfer', href: '/transfer', icon: ArrowsRightLeftIcon },
    { name: 'Rewards', href: '/rewards', icon: GiftIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={twMerge(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-dark-600 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-dark-400">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
                <WalletIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                CryptoVault
              </span>
            </div>
            {isMobile && (
              <button onClick={onClose} className="lg:hidden">
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      twMerge(
                        'flex items-center p-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary-900/20 text-primary-400'
                          : 'text-gray-300 hover:bg-dark-500'
                      )
                    }
                    onClick={() => isMobile && onClose()}
                  >
                    <item.icon className="h-6 w-6 mr-3" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-dark-400">
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-dark-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-dark-400">
            <div className="bg-dark-700 rounded-lg p-3">
              <div className="flex items-center">
                <div className="bg-primary-600/20 p-2 rounded-full">
                  <Cog8ToothIcon className="h-5 w-5 text-primary-400" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-400">Need Help?</p>
                  <a
                    href="#"
                    className="text-sm font-medium text-primary-400 hover:text-primary-300"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;