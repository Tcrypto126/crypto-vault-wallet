import { useState } from 'react';
import { WalletIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';
import { motion } from 'framer-motion';

interface BalanceCardProps {
  balance: number;
}

const BalanceCard = ({ balance }: BalanceCardProps) => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  return (
    <motion.div 
      className="card bg-gradient-to-br from-primary-900/50 to-dark-700 border border-primary-800/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary-800/30 rounded-lg">
            <WalletIcon className="h-5 w-5 text-primary-400" />
          </div>
          <h3 className="text-primary-300 font-medium">Current Balance</h3>
        </div>
        <button
          onClick={() => setIsBalanceHidden(!isBalanceHidden)}
          className="text-gray-400 hover:text-white"
        >
          {isBalanceHidden ? (
            <EyeIcon className="h-5 w-5" />
          ) : (
            <EyeSlashIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="mt-4">
        {isBalanceHidden ? (
          <div className="flex items-center">
            <div className="bg-dark-600/70 rounded-lg px-4 py-2 inline-block">
              <span className="text-2xl font-bold text-white">••••••</span>
            </div>
          </div>
        ) : (
          <motion.h2 
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {formatCurrency(balance)}
          </motion.h2>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link
          to="/transfer"
          className="bg-primary-700 hover:bg-primary-800 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors flex-1"
        >
          Send
        </Link>
        <Link
          to="/transactions"
          className="bg-dark-600 hover:bg-dark-700 text-white text-center py-2 px-4 rounded-lg border border-dark-500 text-sm font-medium transition-colors flex-1"
        >
          History
        </Link>
      </div>
    </motion.div>
  );
};

// Adding Link component since this code wouldn't work without it
const Link = ({ to, className, children }: { to: string, className: string, children: React.ReactNode }) => {
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
};

export default BalanceCard;