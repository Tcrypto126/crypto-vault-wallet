import { motion } from 'framer-motion';
import { WalletIcon } from '@heroicons/react/24/outline';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-dark-800 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 0, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="bg-gradient-to-r from-primary-600 to-secondary-600 p-4 rounded-xl inline-block mb-4"
        >
          <WalletIcon className="h-12 w-12 text-white" />
        </motion.div>
        
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="text-2xl font-semibold text-white"
        >
          Loading CryptoVault
        </motion.h2>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mt-4 w-48"
        />
      </motion.div>
    </div>
  );
};

export default LoadingScreen;