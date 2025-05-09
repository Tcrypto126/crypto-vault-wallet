import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  BONUS = 'bonus'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference_id?: string;
  recipient_wallet_id?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionCreationAttrs {
  wallet_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status?: TransactionStatus;
  reference_id?: string;
  recipient_wallet_id?: string;
  description?: string;
}

export class TransactionModel {
  static async create(transactionData: TransactionCreationAttrs): Promise<Transaction> {
    const { 
      wallet_id, 
      type, 
      amount, 
      currency, 
      status = TransactionStatus.PENDING,
      reference_id = null,
      recipient_wallet_id = null,
      description = null
    } = transactionData;
    
    const id = uuidv4();
    
    const result = await pool.query(
      `INSERT INTO transactions 
       (id, wallet_id, type, amount, currency, status, reference_id, recipient_wallet_id, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, wallet_id, type, amount, currency, status, reference_id, recipient_wallet_id, description]
    );

    return result.rows[0];
  }

  static async findById(id: string): Promise<Transaction | null> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async findByWalletId(walletId: string, limit = 50, offset = 0): Promise<Transaction[]> {
    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE wallet_id = $1 OR recipient_wallet_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [walletId, limit, offset]
    );

    return result.rows;
  }

  static async updateStatus(
    id: string, 
    status: TransactionStatus
  ): Promise<Transaction> {
    const result = await pool.query(
      `UPDATE transactions 
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  static async getTransactionsByUserId(
    userId: string,
    limit = 50, 
    offset = 0
  ): Promise<Transaction[]> {
    const result = await pool.query(
      `SELECT t.* FROM transactions t
       JOIN wallets w ON t.wallet_id = w.id OR t.recipient_wallet_id = w.id
       WHERE w.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  static async countTransactionsByType(
    userId: string,
    type: TransactionType,
    minAmount = 0
  ): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM transactions t
       JOIN wallets w ON t.wallet_id = w.id
       WHERE w.user_id = $1 AND t.type = $2 AND t.amount >= $3 AND t.status = $4`,
      [userId, type, minAmount, TransactionStatus.COMPLETED]
    );

    return parseInt(result.rows[0].count);
  }
}