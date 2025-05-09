import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  GiftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Transaction, TransactionType, TransactionStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { twMerge } from 'tailwind-merge';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionList = ({ transactions, isLoading }: TransactionListProps) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4 py-3">
            <div className="w-10 h-10 bg-dark-500 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-dark-500 rounded w-1/3"></div>
              <div className="h-3 bg-dark-500 rounded w-1/4 mt-2"></div>
            </div>
            <div className="h-5 bg-dark-500 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No transactions found</p>
      </div>
    );
  }

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return <ArrowDownIcon className="h-5 w-5 text-green-500" />;
      case TransactionType.WITHDRAWAL:
        return <ArrowUpIcon className="h-5 w-5 text-red-500" />;
      case TransactionType.TRANSFER_IN:
        return <ArrowsRightLeftIcon className="h-5 w-5 text-blue-500" />;
      case TransactionType.TRANSFER_OUT:
        return <ArrowsRightLeftIcon className="h-5 w-5 text-orange-500" />;
      case TransactionType.REWARD:
        return <GiftIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <ArrowsRightLeftIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case TransactionStatus.PENDING:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case TransactionStatus.FAILED:
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getTransactionLabel = (transaction: Transaction) => {
    switch (transaction.type) {
      case TransactionType.DEPOSIT:
        return 'Deposit';
      case TransactionType.WITHDRAWAL:
        return 'Withdrawal';
      case TransactionType.TRANSFER_IN:
        return `From ${transaction.recipientUsername || 'User'}`;
      case TransactionType.TRANSFER_OUT:
        return `To ${transaction.recipientUsername || 'User'}`;
      case TransactionType.REWARD:
        return 'Reward Bonus';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="space-y-1">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id}
          className="p-3 hover:bg-dark-500/50 rounded-lg transition-colors flex items-center"
        >
          <div className="mr-4 p-2 rounded-full bg-dark-500">
            {getTransactionIcon(transaction.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <p className="text-white font-medium truncate">
                {getTransactionLabel(transaction)}
              </p>
              <span 
                className={twMerge(
                  'font-semibold',
                  transaction.type === TransactionType.DEPOSIT || transaction.type === TransactionType.TRANSFER_IN || transaction.type === TransactionType.REWARD
                    ? 'text-green-500'
                    : 'text-red-500'
                )}
              >
                {transaction.type === TransactionType.DEPOSIT || transaction.type === TransactionType.TRANSFER_IN || transaction.type === TransactionType.REWARD
                  ? '+'
                  : '-'}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
            
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</span>
              <div className="flex items-center text-xs">
                {getStatusIcon(transaction.status)}
                <span
                  className={twMerge(
                    'ml-1',
                    transaction.status === TransactionStatus.COMPLETED
                      ? 'text-green-500'
                      : transaction.status === TransactionStatus.PENDING
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  )}
                >
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;