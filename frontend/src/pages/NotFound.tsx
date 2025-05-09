import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WalletIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-dark-800 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <WalletIcon className="h-24 w-24 text-primary-500 mx-auto mb-8" />
        
        <h1 className="text-7xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
        
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link
          to="/"
          className="btn-primary px-6 py-3"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;