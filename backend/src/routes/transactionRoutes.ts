import { Router } from 'express';
import { 
  getTransaction,
  getTransactionHistory,
  syncOxapayTransactions
} from '../controllers/transactionController';
import { auth } from '../middlewares/auth';

const router = Router();

// Transaction routes
router.get('/:id', auth, getTransaction);
router.get('/', auth, getTransactionHistory);
router.post('/sync-oxapay', auth, syncOxapayTransactions);

export default router;