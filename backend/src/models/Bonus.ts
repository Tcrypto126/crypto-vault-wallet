import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export enum BonusStatus {
  PENDING = 'pending',
  CLAIMED = 'claimed',
  EXPIRED = 'expired'
}

export enum BonusType {
  WHEEL_OF_FORTUNE = 'wheel_of_fortune',
  SIGN_UP = 'sign_up',
  REFERRAL = 'referral'
}

export interface Bonus {
  id: string;
  user_id: string;
  type: BonusType;
  amount: number;
  status: BonusStatus;
  expiry_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BonusCreationAttrs {
  user_id: string;
  type: BonusType;
  amount: number;
  status?: BonusStatus;
  expiry_date?: Date;
}

export class BonusModel {
  static async create(bonusData: BonusCreationAttrs): Promise<Bonus> {
    const { 
      user_id, 
      type, 
      amount, 
      status = BonusStatus.PENDING,
      expiry_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    } = bonusData;
    
    const id = uuidv4();
    
    const result = await pool.query(
      `INSERT INTO bonuses 
       (id, user_id, type, amount, status, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, user_id, type, amount, status, expiry_date]
    );

    return result.rows[0];
  }

  static async findById(id: string): Promise<Bonus | null> {
    const result = await pool.query(
      'SELECT * FROM bonuses WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<Bonus[]> {
    const result = await pool.query(
      'SELECT * FROM bonuses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows;
  }

  static async updateStatus(
    id: string, 
    status: BonusStatus
  ): Promise<Bonus> {
    const result = await pool.query(
      `UPDATE bonuses 
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  static async checkEligibility(
    userId: string, 
    type: BonusType
  ): Promise<boolean> {
    // Specific eligibility logic for Wheel of Fortune
    if (type === BonusType.WHEEL_OF_FORTUNE) {
      // Check if user has made a withdrawal >= $1,500
      const result = await pool.query(
        `SELECT COUNT(*) FROM transactions t
         JOIN wallets w ON t.wallet_id = w.id
         WHERE w.user_id = $1 
         AND t.type = 'withdrawal' 
         AND t.amount >= 1500 
         AND t.status = 'completed'`,
        [userId]
      );
      
      const hasQualifyingWithdrawal = parseInt(result.rows[0].count) > 0;
      
      // Check if user has already claimed this type of bonus
      const bonusResult = await pool.query(
        `SELECT COUNT(*) FROM bonuses
         WHERE user_id = $1 AND type = $2 AND status = 'claimed'`,
        [userId, type]
      );
      
      const hasAlreadyClaimed = parseInt(bonusResult.rows[0].count) > 0;
      
      // User is eligible if they have a qualifying withdrawal and haven't claimed the bonus yet
      return hasQualifyingWithdrawal && !hasAlreadyClaimed;
    }
    
    return false;
  }
}