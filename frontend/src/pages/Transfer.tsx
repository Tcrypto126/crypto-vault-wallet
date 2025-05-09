import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowsRightLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useTransactions } from '@/contexts/TransactionContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';
import { Transfer } from '@/types';

const transferSchema = z.object({
  recipientUsername: z.string().min(1, 'Recipient username is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  description: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

const TransferPage = () => {
  const { user } = useAuth();
  const { createTransfer } = useTransactions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [recipient, setRecipient] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TransferFormData>();

  const amount = watch('amount', 0);

  const onSubmit = async (data: TransferFormData) => {
    try {
      setIsSubmitting(true);
      
      const transferData: Transfer = {
        recipientUsername: data.recipientUsername,
        amount: data.amount,
        description: data.description || undefined,
        recipientId: '', // This will be resolved by the backend
      };

      const success = await createTransfer(transferData);
      
      if (success) {
        setRecipient(data.recipientUsername);
        setTransferSuccess(true);
        reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewTransfer = () => {
    setTransferSuccess(false);
    setRecipient('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Transfer Funds</h1>
        <p className="text-gray-400">Send money to other users on the platform</p>
      </div>

      {transferSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card text-center py-10"
        >
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Transfer Successful!</h2>
          <p className="text-gray-400 mb-6">
            Your transfer to <span className="text-primary-400">{recipient}</span> has been processed successfully.
          </p>
          
          <button
            onClick={handleNewTransfer}
            className="btn-primary"
          >
            Make Another Transfer
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-primary-900/50 rounded-full flex items-center justify-center">
              <ArrowsRightLeftIcon className="h-6 w-6 text-primary-400" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-white">Transfer Details</h2>
              <p className="text-sm text-gray-400">Your current balance: {formatCurrency(user?.balance || 0)}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="recipientUsername" className="label">
                  Recipient Username
                </label>
                <input
                  type="text"
                  id="recipientUsername"
                  className={`input-field ${errors.recipientUsername ? 'border-red-500' : ''}`}
                  placeholder="Enter username"
                  {...register('recipientUsername', { required: true })}
                />
                {errors.recipientUsername && (
                  <p className="error-message">
                    {errors.recipientUsername.message || 'Recipient username is required'}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="amount" className="label">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0.01"
                    className={`input-field pl-7 ${errors.amount ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                    {...register('amount', { 
                      required: true, 
                      valueAsNumber: true,
                      validate: value => (value > 0 && value <= (user?.balance || 0)) || 'Insufficient funds'
                    })}
                  />
                </div>
                {errors.amount && (
                  <p className="error-message">
                    {errors.amount.message || 'Valid amount is required'}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Available: {formatCurrency(user?.balance || 0)}
                </p>
              </div>
              
              <div>
                <label htmlFor="description" className="label">
                  Description (optional)
                </label>
                <input
                  type="text"
                  id="description"
                  className="input-field"
                  placeholder="What's this transfer for?"
                  {...register('description')}
                />
              </div>
              
              <div className="mt-6 bg-dark-700 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white font-medium">{formatCurrency(amount || 0)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Fee:</span>
                  <span className="text-white font-medium">{formatCurrency(0)}</span>
                </div>
                <div className="border-t border-dark-500 my-2 pt-2 flex justify-between">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-white font-semibold">{formatCurrency(amount || 0)}</span>
                </div>
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isSubmitting || amount > (user?.balance || 0)}
              >
                {isSubmitting ? 'Processing...' : 'Send Transfer'}
              </button>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                All transfers are processed instantly within the CryptoVault platform.
              </p>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default TransferPage;