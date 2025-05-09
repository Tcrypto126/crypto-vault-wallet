import { useState } from 'react';
import { 
  FunnelIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useTransactions } from '@/contexts/TransactionContext';
import { Transaction, TransactionType, TransactionStatus } from '@/types';
import TransactionList from '@/components/transactions/TransactionList';

const Transactions = () => {
  const { transactions, loading, fetchTransactions, fetchMoreTransactions, hasMore } = useTransactions();
  const [filters, setFilters] = useState<{
    type: TransactionType | 'all';
    status: TransactionStatus | 'all';
    search: string;
  }>({
    type: 'all',
    status: 'all',
    search: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handleLoadMore = () => {
    fetchMoreTransactions();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesStatus = filters.status === 'all' || transaction.status === filters.status;
    const matchesSearch = 
      filters.search === '' || 
      transaction.reference?.toLowerCase().includes(filters.search.toLowerCase()) || 
      transaction.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      (transaction.recipientUsername && transaction.recipientUsername.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          <p className="text-gray-400">View all your transactions and their status</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-dark-600 text-white hover:bg-dark-500 transition-colors"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg ${
              showFilters ? 'bg-primary-600 text-white' : 'bg-dark-600 text-white'
            } hover:bg-primary-700 transition-colors flex items-center`}
          >
            <FunnelIcon className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="card mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Types</option>
                <option value={TransactionType.DEPOSIT}>Deposit</option>
                <option value={TransactionType.WITHDRAWAL}>Withdrawal</option>
                <option value={TransactionType.TRANSFER_IN}>Transfer In</option>
                <option value={TransactionType.TRANSFER_OUT}>Transfer Out</option>
                <option value={TransactionType.REWARD}>Reward</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field w-full"
              >
                <option value="all">All Statuses</option>
                <option value={TransactionStatus.COMPLETED}>Completed</option>
                <option value={TransactionStatus.PENDING}>Pending</option>
                <option value={TransactionStatus.FAILED}>Failed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search reference, description, or user..."
                className="input-field w-full"
              />
            </div>
          </div>
          
          <div className="flex mt-4 space-x-2">
            <button
              onClick={() => setFilters({ type: 'all', status: 'all', search: '' })}
              className="btn-secondary text-sm"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>
      )}

      <div className="mb-6 flex flex-wrap gap-4">
        <div 
          className={`flex items-center px-3 py-1.5 rounded-full ${
            filters.status === 'all' || filters.status === TransactionStatus.COMPLETED
            ? 'bg-green-900/30 text-green-400'
            : 'bg-dark-600 text-gray-400'
          } cursor-pointer`}
          onClick={() => handleFilterChange('status', 
            filters.status === TransactionStatus.COMPLETED ? 'all' : TransactionStatus.COMPLETED
          )}
        >
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">Completed</span>
        </div>
        
        <div 
          className={`flex items-center px-3 py-1.5 rounded-full ${
            filters.status === TransactionStatus.PENDING
            ? 'bg-yellow-900/30 text-yellow-400'
            : 'bg-dark-600 text-gray-400'
          } cursor-pointer`}
          onClick={() => handleFilterChange('status', 
            filters.status === TransactionStatus.PENDING ? 'all' : TransactionStatus.PENDING
          )}
        >
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">Pending</span>
        </div>
        
        <div 
          className={`flex items-center px-3 py-1.5 rounded-full ${
            filters.status === TransactionStatus.FAILED
            ? 'bg-red-900/30 text-red-400'
            : 'bg-dark-600 text-gray-400'
          } cursor-pointer`}
          onClick={() => handleFilterChange('status', 
            filters.status === TransactionStatus.FAILED ? 'all' : TransactionStatus.FAILED
          )}
        >
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">Failed</span>
        </div>
      </div>

      <div className="card">
        <TransactionList 
          transactions={filteredTransactions} 
          isLoading={loading} 
        />
        
        {filteredTransactions.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-400">No transactions found</p>
          </div>
        )}
        
        {hasMore && filteredTransactions.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Transactions;