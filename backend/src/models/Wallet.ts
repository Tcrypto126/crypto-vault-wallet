import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export class WalletModel {
  static async create(userId: string, currency: string = 'USD'): Promise<Wallet> {
    const id = uuidv4();
    
    const result = await pool.query(
      `INSERT INTO wallets (id, user_id, balance, currency)
       VALUES ($1, $2, 0, $3)
       RETURNING *`,
      [id, userId, currency]
    );

    return result.rows[0];
  }

  static async findByUserId(userId: string): Promise<Wallet | null> {
    const result = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1',
      [userId]
    );

    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<Wallet | null> {
    const result = await pool.query(
      'SELECT * FROM wallets WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async updateBalance(
    id: string, 
    amount: number
  ): Promise<Wallet> {
    const result = await pool.query(
      `UPDATE wallets 
       SET balance = balance + $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [amount, id]
    );

    return result.rows[0];
  }

  static async getBalance(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT balance FROM wallets WHERE user_id = $1',
      [userId]
    );

    return result.rows[0]?.balance || 0;
  }
}