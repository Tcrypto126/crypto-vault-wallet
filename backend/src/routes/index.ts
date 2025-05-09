import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import walletRoutes from './walletRoutes';
import transactionRoutes from './transactionRoutes';
import bonusRoutes from './bonusRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/transactions', transactionRoutes);
router.use('/bonus', bonusRoutes);

export default router;