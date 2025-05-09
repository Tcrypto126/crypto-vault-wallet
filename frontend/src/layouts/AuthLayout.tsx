import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WalletIcon } from '@heroicons/react/24/outline';

const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-dark-800 text-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-20">
        <motion.div 
          key={location.pathname}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-xl">
              <WalletIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight mb-8">
            {location.pathname === '/login' && 'Sign in to your account'}
            {location.pathname === '/register' && 'Create a new account'}
            {location.pathname === '/forgot-password' && 'Reset your password'}
          </h2>
          
          {/* Outlet for Auth Pages */}
          <Outlet />
        </motion.div>
      </div>

      {/* Right Side - Showcase Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-700 via-dark-800 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-secondary-600/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/assets/crypto-pattern.svg')] opacity-5"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-dark-600/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-dark-500/50">
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                CryptoVault Platform
              </h3>
              <p className="text-xl text-gray-300 mb-8">
                The secure way to manage your crypto wallet, make transfers, and earn rewards.
              </p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="flex items-start">
                  <div className="bg-primary-700/30 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Virtual Balance</h4>
                    <p className="text-gray-400 text-sm">Real-time transaction tracking</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-700/30 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Secure Transfers</h4>
                    <p className="text-gray-400 text-sm">Fast & verified transactions</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-700/30 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Bonus Rewards</h4>
                    <p className="text-gray-400 text-sm">Wheel of Fortune rewards</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-700/30 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Email Notifications</h4>
                    <p className="text-gray-400 text-sm">Stay informed on all activities</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;