import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Transaction, Transfer, TransactionStatus, TransactionType, ApiResponse } from '@/types';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

interface TransactionContextValue {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  createTransfer: (transferData: Transfer) => Promise<boolean>;
  fetchMoreTransactions: () => Promise<void>;
  hasMore: boolean;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const { socket } = useSocket();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<ApiResponse<Transaction[]>>('/transactions', {
        params: { page: 1, limit: 20 },
      });

      if (response.data.success && response.data.data) {
        setTransactions(response.data.data);
        setPage(1);
        setHasMore(response.data.data.length >= 20);
      } else {
        setError(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError('Failed to fetch transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchMoreTransactions = useCallback(async () => {
    if (!isAuthenticated || loading || !hasMore) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      
      const response = await api.get<ApiResponse<Transaction[]>>('/transactions', {
        params: { page: nextPage, limit: 20 },
      });

      if (response.data.success && response.data.data) {
        setTransactions(prev => [...prev, ...response.data.data]);
        setPage(nextPage);
        setHasMore(response.data.data.length >= 20);
      } else {
        setError(response.data.message || 'Failed to fetch more transactions');
      }
    } catch (error) {
      console.error('Failed to fetch more transactions:', error);
      setError('Failed to fetch more transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loading, hasMore, page]);

  const getTransactionById = useCallback(
    (id: string) => transactions.find((transaction) => transaction.id === id),
    [transactions]
  );

  const createTransfer = useCallback(async (transferData: Transfer): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      
      const response = await api.post<ApiResponse<Transaction>>('/transactions/transfer', transferData);

      if (response.data.success && response.data.data) {
        // Add the new transaction to the list
        setTransactions(prev => [response.data.data as Transaction, ...prev]);
        toast.success('Transfer completed successfully');
        return true;
      } else {
        toast.error(response.data.message || 'Transfer failed');
        return false;
      }
    } catch (error) {
      console.error('Failed to create transfer:', error);
      toast.error('Failed to create transfer. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Listen for real-time transaction updates
  useEffect(() => {
    if (!socket || !isAuthenticated || !user) return;

    const handleNewTransaction = (transaction: Transaction) => {
      if (transaction.userId === user.id || transaction.recipientId === user.id) {
        setTransactions(prev => {
          // Check if the transaction already exists
          const exists = prev.some(t => t.id === transaction.id);
          if (exists) {
            // If it exists, update it
            return prev.map(t => t.id === transaction.id ? transaction : t);
          } else {
            // If it doesn't exist, add it to the beginning
            return [transaction, ...prev];
          }
        });

        // Show notification for the new transaction
        let message = '';
        switch (transaction.type) {
          case TransactionType.DEPOSIT:
            message = `Deposit of $${transaction.amount.toFixed(2)} ${transaction.status === TransactionStatus.COMPLETED ? 'completed' : 'is ' + transaction.status}`;
            break;
          case TransactionType.WITHDRAWAL:
            message = `Withdrawal of $${transaction.amount.toFixed(2)} ${transaction.status === TransactionStatus.COMPLETED ? 'completed' : 'is ' + transaction.status}`;
            break;
          case TransactionType.TRANSFER_IN:
            message = `Received $${transaction.amount.toFixed(2)} from ${transaction.recipientUsername || 'another user'}`;
            break;
          case TransactionType.TRANSFER_OUT:
            message = `Sent $${transaction.amount.toFixed(2)} to ${transaction.recipientUsername || 'another user'}`;
            break;
          case TransactionType.REWARD:
            message = `Received $${transaction.amount.toFixed(2)} bonus reward!`;
            break;
          default:
            message = `Transaction of $${transaction.amount.toFixed(2)} ${transaction.status === TransactionStatus.COMPLETED ? 'completed' : 'is ' + transaction.status}`;
        }

        toast.success(message);
      }
    };

    const handleTransactionStatusChange = (updatedTransaction: Transaction) => {
      if (updatedTransaction.userId === user.id || updatedTransaction.recipientId === user.id) {
        setTransactions(prev => 
          prev.map(transaction => 
            transaction.id === updatedTransaction.id ? updatedTransaction : transaction
          )
        );

        if (updatedTransaction.status === TransactionStatus.COMPLETED) {
          toast.success(`Transaction of $${updatedTransaction.amount.toFixed(2)} has been completed`);
        } else if (updatedTransaction.status === TransactionStatus.FAILED) {
          toast.error(`Transaction of $${updatedTransaction.amount.toFixed(2)} has failed`);
        }
      }
    };

    socket.on('newTransaction', handleNewTransaction);
    socket.on('transactionStatusChange', handleTransactionStatusChange);

    return () => {
      socket.off('newTransaction', handleNewTransaction);
      socket.off('transactionStatusChange', handleTransactionStatusChange);
    };
  }, [socket, isAuthenticated, user]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, fetchTransactions]);

  return (
    <TransactionContext.Provider value={{
      transactions,
      loading,
      error,
      fetchTransactions,
      getTransactionById,
      createTransfer,
      fetchMoreTransactions,
      hasMore
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }

  return context;
};