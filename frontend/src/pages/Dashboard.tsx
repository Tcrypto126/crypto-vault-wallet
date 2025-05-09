import { useEffect, useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { GiftIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { TransactionType, TransactionStatus } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import BalanceCard from '@/components/dashboard/BalanceCard';
import TransactionList from '@/components/transactions/TransactionList';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const [isRewardEligible, setIsRewardEligible] = useState<boolean>(false);
  const [chartData, setChartData] = useState<any>(null);

  // Check if user is eligible for reward (has completed a withdrawal >= $1,500)
  useEffect(() => {
    const hasCompletedLargeWithdrawal = transactions.some(
      transaction => 
        transaction.type === TransactionType.WITHDRAWAL && 
        transaction.status === TransactionStatus.COMPLETED && 
        transaction.amount >= 1500
    );
    
    setIsRewardEligible(hasCompletedLargeWithdrawal);
  }, [transactions]);

  // Prepare chart data
  useEffect(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyBalances: Record<string, number> = {};
    
    // Initialize with zero values
    last7Days.forEach(day => {
      dailyBalances[day] = 0;
    });

    // Simulate balance history - in a real app, you'd get this from an API
    // For demo purposes, we'll create realistic looking data
    let balance = user?.balance || 0;
    for (let i = 6; i >= 0; i--) {
      const date = last7Days[6 - i];
      const randomChange = Math.random() * 600 - 300; // Random value between -300 and 300
      balance = i === 0 ? (user?.balance || 0) : balance - randomChange;
      dailyBalances[date] = Math.max(0, Math.round(balance * 100) / 100);
    }

    setChartData({
      labels: last7Days.map(day => {
        const date = new Date(day);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: 'Balance',
          data: Object.values(dailyBalances),
          fill: true,
          backgroundColor: 'rgba(14, 165, 233, 0.2)',
          borderColor: 'rgba(14, 165, 233, 1)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(14, 165, 233, 1)',
          pointBorderColor: '#fff',
          pointRadius: 4,
        },
      ],
    });
  }, [user?.balance]);

  // Recent transactions for the dashboard
  const recentTransactions = transactions.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Overview of your wallet activity</p>
      </div>

      {isRewardEligible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-secondary-900 to-primary-900 rounded-xl p-4 border border-secondary-700"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-secondary-600/30 p-2 mr-4">
              <GiftIcon className="h-6 w-6 text-secondary-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-secondary-300">Reward Available!</h3>
              <p className="text-white text-sm">You've qualified for a bonus reward. Try your luck!</p>
            </div>
            <Link
              to="/rewards"
              className="bg-secondary-600 hover:bg-secondary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Claim Now
            </Link>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <BalanceCard 
          balance={user?.balance || 0} 
        />

        <div className="card md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Balance History</h2>
            <div className="flex items-center text-xs text-gray-400">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>Last 7 days</span>
            </div>
          </div>
          <div className="h-64">
            {chartData ? (
              <Line 
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: false,
                      grid: {
                        color: 'rgba(75, 85, 99, 0.2)',
                      },
                      ticks: {
                        callback: function(value) {
                          return '$' + value;
                        },
                        color: 'rgba(156, 163, 175, 1)',
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: 'rgba(156, 163, 175, 1)',
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      titleColor: 'rgba(255, 255, 255, 1)',
                      bodyColor: 'rgba(255, 255, 255, 1)',
                      borderColor: 'rgba(75, 85, 99, 0.3)',
                      borderWidth: 1,
                      padding: 10,
                      displayColors: false,
                      callbacks: {
                        label: function(context) {
                          return '$' + context.parsed.y;
                        }
                      }
                    }
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-green-900/20 border border-green-800/30">
          <div className="flex items-center mb-2">
            <div className="p-3 bg-green-800/30 rounded-lg mr-4">
              <ArrowDownIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-green-400 font-medium">Total Deposits</h3>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(
                  transactions
                    .filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.COMPLETED)
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card bg-red-900/20 border border-red-800/30">
          <div className="flex items-center mb-2">
            <div className="p-3 bg-red-800/30 rounded-lg mr-4">
              <ArrowUpIcon className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-red-400 font-medium">Total Withdrawals</h3>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(
                  transactions
                    .filter(t => t.type === TransactionType.WITHDRAWAL && t.status === TransactionStatus.COMPLETED)
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card bg-secondary-900/20 border border-secondary-800/30">
          <div className="flex items-center mb-2">
            <div className="p-3 bg-secondary-800/30 rounded-lg mr-4">
              <CurrencyDollarIcon className="h-6 w-6 text-secondary-500" />
            </div>
            <div>
              <h3 className="text-secondary-400 font-medium">Transfer Volume</h3>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(
                  transactions
                    .filter(t => 
                      (t.type === TransactionType.TRANSFER_IN || t.type === TransactionType.TRANSFER_OUT) && 
                      t.status === TransactionStatus.COMPLETED
                    )
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-primary-400 hover:text-primary-300 text-sm font-medium"
          >
            View all
          </Link>
        </div>
        
        <TransactionList transactions={recentTransactions} isLoading={false} />
        
        {recentTransactions.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-400">No recent transactions</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;