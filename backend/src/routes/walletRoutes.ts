import { Router } from 'express';
import { 
  getWallet, 
  getTransactions, 
  initiateTransfer
} from '../controllers/walletController';
import { auth } from '../middlewares/auth';
import { validateTransfer } from '../validators/transactionValidators';

const router = Router();

// Wallet routes
router.get('/', auth, getWallet);
router.get('/transactions', auth, getTransactions);
router.post('/transfer', auth, validateTransfer, initiateTransfer);

export default router;