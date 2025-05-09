import { Response, NextFunction } from 'express';
import { BonusModel, BonusType, BonusStatus } from '../models/Bonus';
import { TransactionModel, TransactionType, TransactionStatus } from '../models/Transaction';
import { WalletModel } from '../models/Wallet';
import { AuthRequest } from '../middlewares/auth';
import { ApiError } from '../middlewares/errorHandler';
import { sendEmail } from '../utils/emailService';

// Check bonus eligibility
export const checkBonusEligibility = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    const eligibility = await BonusModel.checkEligibility(req.user.id, BonusType.WHEEL_OF_FORTUNE);

    res.status(200).json({
      success: true,
      eligible: eligibility,
      bonusType: BonusType.WHEEL_OF_FORTUNE
    });
  } catch (error) {
    next(error);
  }
};

// Spin Wheel of Fortune
export const spinWheelOfFortune = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    // Check eligibility
    const eligibility = await BonusModel.checkEligibility(req.user.id, BonusType.WHEEL_OF_FORTUNE);
    if (!eligibility) {
      const error: ApiError = new Error('You are not eligible for this bonus');
      error.statusCode = 403;
      throw error;
    }

    // Define wheel segments (prize amounts)
    const wheelSegments = [50, 100, 150, 200, 250, 500, 1000];
    
    // Randomly select a prize
    const prizeIndex = Math.floor(Math.random() * wheelSegments.length);
    const prizeAmount = wheelSegments[prizeIndex];
    
    // Create bonus
    const bonus = await BonusModel.create({
      user_id: req.user.id,
      type: BonusType.WHEEL_OF_FORTUNE,
      amount: prizeAmount,
      status: BonusStatus.PENDING,
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    // Send email notification
    sendEmail({
      to: req.user.email,
      subject: 'You Won a Bonus!',
      text: `Congratulations! You've won a ${prizeAmount} USD bonus. Claim it now in your dashboard.`,
      html: `<h1>Congratulations!</h1>
             <p>You've won a <strong>${prizeAmount} USD</strong> bonus from the Wheel of Fortune.</p>
             <p>Claim it now in your dashboard before it expires.</p>`
    }).catch(err => console.error('Error sending bonus notification email:', err));

    res.status(200).json({
      success: true,
      bonus: {
        id: bonus.id,
        amount: bonus.amount,
        type: bonus.type,
        status: bonus.status,
        expiry_date: bonus.expiry_date
      },
      message: `Congratulations! You've won ${prizeAmount} USD`
    });
  } catch (error) {
    next(error);
  }
};

// Claim bonus
export const claimBonus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    const { id } = req.params;

    // Get the bonus
    const bonus = await BonusModel.findById(id);
    if (!bonus) {
      const error: ApiError = new Error('Bonus not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if bonus belongs to the user
    if (bonus.user_id !== req.user.id) {
      const error: ApiError = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Check if bonus is still pending
    if (bonus.status !== BonusStatus.PENDING) {
      const error: ApiError = new Error(`Bonus already ${bonus.status}`);
      error.statusCode = 400;
      throw error;
    }

    // Check if bonus has expired
    if (new Date(bonus.expiry_date) < new Date()) {
      await BonusModel.updateStatus(id, BonusStatus.EXPIRED);
      const error: ApiError = new Error('Bonus has expired');
      error.statusCode = 400;
      throw error;
    }

    // Get user wallet
    const wallet = await WalletModel.findByUserId(req.user.id);
    if (!wallet) {
      const error: ApiError = new Error('Wallet not found');
      error.statusCode = 404;
      throw error;
    }

    // Create transaction
    await TransactionModel.create({
      wallet_id: wallet.id,
      type: TransactionType.BONUS,
      amount: bonus.amount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: `Claimed ${bonus.type} bonus`
    });

    // Update wallet balance
    await WalletModel.updateBalance(wallet.id, bonus.amount);

    // Update bonus status
    const updatedBonus = await BonusModel.updateStatus(id, BonusStatus.CLAIMED);

    // Send email notification
    sendEmail({
      to: req.user.email,
      subject: 'Bonus Claimed Successfully',
      text: `You have successfully claimed your ${bonus.amount} USD bonus. It has been added to your wallet.`,
      html: `<h1>Bonus Claimed Successfully</h1>
             <p>You have successfully claimed your <strong>${bonus.amount} USD</strong> bonus.</p>
             <p>It has been added to your wallet.</p>`
    }).catch(err => console.error('Error sending bonus claim notification email:', err));

    res.status(200).json({
      success: true,
      bonus: updatedBonus,
      message: 'Bonus claimed successfully'
    });
  } catch (error) {
    next(error);
  }
};