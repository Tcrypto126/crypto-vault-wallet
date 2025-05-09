import { Response, NextFunction } from 'express';
import { TransactionModel, TransactionStatus, TransactionType } from '../models/Transaction';
import { WalletModel } from '../models/Wallet';
import { AuthRequest } from '../middlewares/auth';
import { ApiError } from '../middlewares/errorHandler';
import { fetchOxapayTransactions } from '../services/oxapayService';
import { sendEmail } from '../utils/emailService';
import pool from '../config/database';

// Get a specific transaction
export const getTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    const { id } = req.params;

    // Get user wallet
    const wallet = await WalletModel.findByUserId(req.user.id);
    if (!wallet) {
      const error: ApiError = new Error('Wallet not found');
      error.statusCode = 404;
      throw error;
    }

    // Get transaction
    const transaction = await TransactionModel.findById(id);
    if (!transaction) {
      const error: ApiError = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if transaction belongs to the user
    if (transaction.wallet_id !== wallet.id && transaction.recipient_wallet_id !== wallet.id) {
      const error: ApiError = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction history
export const getTransactionHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const type = req.query.type as TransactionType | undefined;
    const status = req.query.status as TransactionStatus | undefined;

    // Get transactions by user ID with optional filtering
    let query = `
      SELECT t.* FROM transactions t
      JOIN wallets w ON t.wallet_id = w.id OR t.recipient_wallet_id = w.id
      WHERE w.user_id = $1
    `;
    
    const queryParams: any[] = [req.user.id];
    let paramCount = 2;
    
    if (type) {
      query += ` AND t.type = $${paramCount}`;
      queryParams.push(type);
      paramCount++;
    }
    
    if (status) {
      query += ` AND t.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    const transactions = result.rows;

    res.status(200).json({
      success: true,
      transactions,
      count: transactions.length,
      total: parseInt(result.rows[0]?.total_count || '0')
    });
  } catch (error) {
    next(error);
  }
};

// Sync transactions from Oxapay
export const syncOxapayTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    // Get user wallet
    const wallet = await WalletModel.findByUserId(req.user.id);
    if (!wallet) {
      const error: ApiError = new Error('Wallet not found');
      error.statusCode = 404;
      throw error;
    }

    // This would be a call to the actual Oxapay API
    const externalTransactions = await fetchOxapayTransactions(req.user.id);

    // Process each transaction
    const processedTransactions = [];
    for (const extTx of externalTransactions) {
      // Check if transaction already exists
      const existingTxResult = await pool.query(
        'SELECT id FROM transactions WHERE reference_id = $1',
        [extTx.id]
      );
      
      if (existingTxResult.rows.length === 0) {
        // Create new transaction
        const transaction = await TransactionModel.create({
          wallet_id: wallet.id,
          type: extTx.type === 'deposit' ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
          amount: extTx.amount,
          currency: extTx.currency,
          status: TransactionStatus.COMPLETED,
          reference_id: extTx.id,
          description: `Oxapay ${extTx.type}`
        });
        
        // Update wallet balance for deposits
        if (extTx.type === 'deposit') {
          await WalletModel.updateBalance(wallet.id, extTx.amount);
          
          // Send email notification
          sendEmail({
            to: req.user.email,
            subject: 'Deposit Received',
            text: `You have received a deposit of ${extTx.amount} ${extTx.currency} in your wallet.`,
            html: `<h1>Deposit Received</h1>
                   <p>You have received a deposit of ${extTx.amount} ${extTx.currency} in your wallet.</p>`
          }).catch(err => console.error('Error sending deposit notification email:', err));
        }
        
        processedTransactions.push(transaction);
      }
    }

    res.status(200).json({
      success: true,
      transactions: processedTransactions,
      message: `${processedTransactions.length} new transactions have been synced`
    });
  } catch (error) {
    next(error);
  }
};