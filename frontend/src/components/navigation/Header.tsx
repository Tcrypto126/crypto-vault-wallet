import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

const Header = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'Your transfer of $500 has been completed',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: '2',
      message: 'You received $100 from John Doe',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      message: 'You have earned a bonus reward! Claim it now.',
      time: '1 day ago',
      read: true,
    },
  ]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, read: true }))
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-dark-600 border-b border-dark-400">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-white hidden md:block">
              Welcome, {user?.username || 'User'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-300 hover:text-white relative"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-700 rounded-lg shadow-lg border border-dark-400 z-50">
                  <div className="p-3 border-b border-dark-500 flex justify-between items-center">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary-400 hover:text-primary-300"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-dark-500 hover:bg-dark-600 ${
                            !notification.read ? 'bg-dark-600/50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between">
                            <p className={`text-sm ${!notification.read ? 'text-white' : 'text-gray-400'}`}>
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 bg-primary-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        No notifications
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-center border-t border-dark-500">
                    <Link
                      to="/notifications"
                      className="text-xs text-primary-400 hover:text-primary-300"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center">
              <Link
                to="/profile"
                className="flex items-center space-x-2 hover:text-primary-400 transition-colors"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-r from-primary-700 to-secondary-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <span className="hidden md:inline-block font-medium">
                  {user?.username || 'User'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;