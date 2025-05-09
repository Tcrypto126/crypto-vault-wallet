import { Router } from 'express';
import { 
  checkBonusEligibility,
  spinWheelOfFortune,
  claimBonus
} from '../controllers/bonusController';
import { auth } from '../middlewares/auth';

const router = Router();

// Bonus routes
router.get('/eligibility', auth, checkBonusEligibility);
router.post('/wheel-of-fortune/spin', auth, spinWheelOfFortune);
router.post('/claim/:id', auth, claimBonus);

export default router;