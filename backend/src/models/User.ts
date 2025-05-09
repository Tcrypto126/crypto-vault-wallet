import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreationAttrs {
  email: string;
  password: string;
  username: string;
  full_name: string;
}

export class UserModel {
  static async create(userData: UserCreationAttrs): Promise<User> {
    const { email, password, username, full_name } = userData;
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (id, email, password, username, full_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, email.toLowerCase(), hashedPassword, username, full_name]
    );

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async comparePassword(
    candidatePassword: string, 
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async updateProfile(
    id: string, 
    updates: Partial<UserCreationAttrs>
  ): Promise<User> {
    const { username, full_name } = updates;
    
    const result = await pool.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           full_name = COALESCE($2, full_name),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [username, full_name, id]
    );

    return result.rows[0];
  }
}