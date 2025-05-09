import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { WalletModel } from '../models/Wallet';
import { TransactionModel, TransactionType, TransactionStatus } from '../models/Transaction';
import { AuthRequest } from '../middlewares/auth';
import { ApiError } from '../middlewares/errorHandler';
import { sendEmail } from '../utils/emailService';
import pool from '../config/database';

// Get user wallet
export const getWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    const wallet = await WalletModel.findByUserId(req.user.id);
    if (!wallet) {
      const error: ApiError = new Error('Wallet not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        currency: wallet.currency,
        created_at: wallet.created_at,
        updated_at: wallet.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get wallet transactions
export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    const wallet = await WalletModel.findByUserId(req.user.id);
    if (!wallet) {
      const error: ApiError = new Error('Wallet not found');
      error.statusCode = 404;
      throw error;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const transactions = await TransactionModel.findByWalletId(wallet.id, limit, offset);

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// Initiate internal transfer
export const initiateTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: ApiError = new Error('Validation failed');
      error.statusCode = 422;
      throw error;
    }

    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    const { recipient_username, amount, description } = req.body;

    // Get sender wallet
    const senderWallet = await WalletModel.findByUserId(req.user.id);
    if (!senderWallet) {
      const error: ApiError = new Error('Sender wallet not found');
      error.statusCode = 404;
      throw error;
    }

    // Check sufficient balance
    if (senderWallet.balance < amount) {
      const error: ApiError = new Error('Insufficient balance');
      error.statusCode = 400;
      throw error;
    }

    // Get recipient user by username
    const recipientUserResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [recipient_username]
    );
    const recipientUser = recipientUserResult.rows[0];
    
    if (!recipientUser) {
      const error: ApiError = new Error('Recipient user not found');
      error.statusCode = 404;
      throw error;
    }

    // Get recipient wallet
    const recipientWallet = await WalletModel.findByUserId(recipientUser.id);
    if (!recipientWallet) {
      const error: ApiError = new Error('Recipient wallet not found');
      error.statusCode = 404;
      throw error;
    }

    // Create transaction
    const transaction = await TransactionModel.create({
      wallet_id: senderWallet.id,
      type: TransactionType.TRANSFER,
      amount: amount,
      currency: senderWallet.currency,
      status: TransactionStatus.COMPLETED,
      recipient_wallet_id: recipientWallet.id,
      description
    });

    // Update balances
    await WalletModel.updateBalance(senderWallet.id, -amount);
    await WalletModel.updateBalance(recipientWallet.id, amount);

    // Send email notifications
    const senderEmailPromise = sendEmail({
      to: req.user.email,
      subject: 'Transfer Successful',
      text: `You have successfully transferred ${amount} ${senderWallet.currency} to ${recipient_username}.`,
      html: `<h1>Transfer Successful</h1>
             <p>You have successfully transferred ${amount} ${senderWallet.currency} to ${recipient_username}.</p>`
    });
    
    // We need to fetch recipient email too
    const recipientEmailResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [recipientUser.id]
    );
    const recipientEmail = recipientEmailResult.rows[0].email;
    
    const recipientEmailPromise = sendEmail({
      to: recipientEmail,
      subject: 'Transfer Received',
      text: `You have received ${amount} ${recipientWallet.currency} from ${req.user.email}.`,
      html: `<h1>Transfer Received</h1>
             <p>You have received ${amount} ${recipientWallet.currency}.</p>`
    });

    // Wait for both emails to be sent
    await Promise.all([senderEmailPromise, recipientEmailPromise]).catch(err => {
      console.error('Error sending transfer notification emails:', err);
    });

    res.status(200).json({
      success: true,
      transaction,
      message: 'Transfer completed successfully'
    });
  } catch (error) {
    next(error);
  }
};