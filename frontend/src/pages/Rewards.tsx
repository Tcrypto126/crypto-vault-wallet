import { useState, useEffect } from 'react';
import { GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useTransactions } from '@/contexts/TransactionContext';
import { TransactionType, TransactionStatus, RewardOption } from '@/types';
import { formatCurrency } from '@/utils/format';
import { api } from '@/services/api';

const Rewards = () => {
  const { transactions } = useTransactions();
  
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedReward, setSelectedReward] = useState<RewardOption | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [userPrompted, setUserPrompted] = useState<boolean>(false);

  const rewardOptions: RewardOption[] = [
    { id: 1, value: 50, probability: 40 },
    { id: 2, value: 100, probability: 30 },
    { id: 3, value: 200, probability: 15 },
    { id: 4, value: 500, probability: 10 },
    { id: 5, value: 1000, probability: 5 }
  ];

  const totalSections = rewardOptions.length;
  const sectionAngle = 360 / totalSections;
  
  // Check if user is eligible for reward
  useEffect(() => {
    const checkEligibility = () => {
      // Eligible if they have made a withdrawal >= $1,500
      const hasLargeWithdrawal = transactions.some(
        transaction =>
          transaction.type === TransactionType.WITHDRAWAL &&
          transaction.status === TransactionStatus.COMPLETED &&
          transaction.amount >= 1500
      );
      
      // Check if they've already claimed a reward
      const hasClaimedReward = transactions.some(
        transaction => transaction.type === TransactionType.REWARD
      );

      setIsEligible(hasLargeWithdrawal && !hasClaimedReward);
      setUserPrompted(true);
    };

    checkEligibility();
  }, [transactions]);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedReward(null);
    
    // Determine the reward based on probabilities
    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    let selectedOption: RewardOption | null = null;
    
    for (const option of rewardOptions) {
      cumulativeProbability += option.probability;
      if (random <= cumulativeProbability) {
        selectedOption = option;
        break;
      }
    }
    
    if (!selectedOption) {
      selectedOption = rewardOptions[rewardOptions.length - 1];
    }
    
    // Calculate rotation to land on the selected reward
    // Each section is sectionAngle degrees, and we want to land in the middle of the section
    const optionIndex = rewardOptions.findIndex(o => o.id === selectedOption.id);
    const targetRotation = 360 * 5 + (optionIndex * sectionAngle);
    
    // Spin the wheel
    setRotation(targetRotation);

    // After spinning animation ends
    setTimeout(() => {
      setSelectedReward(selectedOption);
      setShowConfetti(true);
      setIsSpinning(false);
      
      // Claim the reward
      if (selectedOption) {
        claimReward(selectedOption);
      }
      
      // Hide confetti after some time
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }, 5000);
  };

  const claimReward = async (reward: RewardOption) => {
    try {
      await api.post('/transactions/reward', { amount: reward.value });
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Rewards Center</h1>
        <p className="text-gray-400">Spin the wheel and win amazing rewards</p>
      </div>
      
      {!userPrompted ? (
        <div className="card p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : !isEligible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <GiftIcon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Not Eligible for Rewards Yet</h2>
          <p className="text-gray-400 mb-6">
            Complete your first withdrawal of $1,500 or more to unlock the Wheel of Fortune reward!
          </p>
          <div className="bg-dark-700 p-6 rounded-lg max-w-md mx-auto">
            <h3 className="text-lg font-medium text-white mb-4">How to Unlock Rewards:</h3>
            <ol className="text-left text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="bg-primary-900 text-primary-400 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                <span>Make a withdrawal of $1,500 or more</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary-900 text-primary-400 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                <span>Wait for the transaction to complete</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary-900 text-primary-400 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                <span>Return to this page to spin the wheel!</span>
              </li>
            </ol>
          </div>
        </motion.div>
      ) : selectedReward ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-6">
            <SparklesIcon className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Congratulations!</h2>
          <p className="text-xl text-gray-300 mb-6">
            You've won <span className="text-primary-400 font-bold">{formatCurrency(selectedReward.value)}</span>!
          </p>
          
          <p className="text-gray-400 mb-8">
            The reward has been added to your wallet balance. Thank you for using CryptoVault!
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Spin the Wheel of Fortune!</h2>
            <p className="text-gray-400">
              You're eligible for a special reward. Spin the wheel to see what you'll win!
            </p>
          </div>
          
          <div className="relative mx-auto w-64 h-64 mb-8">
            {/* Wheel */}
            <svg 
              className="w-full h-full" 
              viewBox="0 0 100 100" 
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
              }}
            >
              <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              
              {rewardOptions.map((option, index) => {
                const startAngle = index * sectionAngle;
                const endAngle = (index + 1) * sectionAngle;
                const x1 = 50 + 48 * Math.cos((startAngle - 90) * (Math.PI / 180));
                const y1 = 50 + 48 * Math.sin((startAngle - 90) * (Math.PI / 180));
                const x2 = 50;
                const y2 = 50;
                
                return (
                  <g key={option.id}>
                    <path
                      d={`M ${x2},${y2} L ${x1},${y1} A 48,48 0 0,1 ${50 + 48 * Math.cos((endAngle - 90) * (Math.PI / 180))},${50 + 48 * Math.sin((endAngle - 90) * (Math.PI / 180))} Z`}
                      fill={index % 2 === 0 ? '#0369a1' : '#0284c7'}
                    />
                    <text
                      x={50 + 30 * Math.cos(((startAngle + endAngle) / 2 - 90) * (Math.PI / 180))}
                      y={50 + 30 * Math.sin(((startAngle + endAngle) / 2 - 90) * (Math.PI / 180))}
                      fill="white"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${(startAngle + endAngle) / 2}, ${50 + 30 * Math.cos(((startAngle + endAngle) / 2 - 90) * (Math.PI / 180))}, ${50 + 30 * Math.sin(((startAngle + endAngle) / 2 - 90) * (Math.PI / 180))})`}
                    >
                      ${option.value}
                    </text>
                  </g>
                );
              })}
              
              <circle cx="50" cy="50" r="5" fill="#334155" />
            </svg>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-secondary-500"></div>
          </div>
          
          <div className="text-center">
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="btn-primary px-8 py-3 text-lg"
            >
              {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
            </button>
          </div>
          
          <div className="mt-8 bg-dark-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Possible Rewards:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              {rewardOptions.map((option) => (
                <div key={option.id} className="bg-dark-600 p-3 rounded-lg">
                  <p className="font-bold text-primary-400">
                    {formatCurrency(option.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Rewards;