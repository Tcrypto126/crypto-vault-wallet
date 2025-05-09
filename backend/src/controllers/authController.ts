import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { WalletModel } from '../models/Wallet';
import { ApiError } from '../middlewares/errorHandler';
import { sendEmail } from '../utils/emailService';
import { v4 as uuidv4 } from 'uuid';

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: ApiError = new Error('Validation failed');
      error.statusCode = 422;
      throw error;
    }

    const { email, password, username, full_name } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      const error: ApiError = new Error('Email already in use');
      error.statusCode = 409;
      throw error;
    }

    // Create user
    const user = await UserModel.create({
      email,
      password,
      username,
      full_name
    });

    // Create wallet for the user
    await WalletModel.create(user.id, 'USD');

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );


    // Send welcome email
    sendEmail({
      to: user.email,
      subject: 'Welcome to Crypto Wallet Platform',
      text: `Hello ${user.full_name}, thank you for joining our platform. Your account has been created successfully.`,
      html: `<h1>Welcome to Crypto Wallet Platform</h1>
             <p>Hello ${user.full_name},</p>
             <p>Thank you for joining our platform. Your account has been created successfully.</p>`
    }).catch(err => console.error('Error sending welcome email:', err));

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: ApiError = new Error('Validation failed');
      error.statusCode = 422;
      throw error;
    }

    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const error: ApiError = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check password
    const isPasswordValid = await UserModel.comparePassword(password, user.password);
    if (!isPasswordValid) {
      const error: ApiError = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id},
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name
      }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: ApiError = new Error('Validation failed');
      error.statusCode = 422;
      throw error;
    }

    const { email } = req.body;

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    // Store reset token in DB (implementation needed)
    
    // In a real implementation, you would save this token in the database
    // associated with the user and with an expiry time

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please use this link to reset your password: ${resetUrl}`,
      html: `<h1>Password Reset</h1>
             <p>You requested a password reset.</p>
             <p>Please click the link below to reset your password:</p>
             <a href="${resetUrl}">Reset Password</a>`
    }).catch(err => console.error('Error sending password reset email:', err));

    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: ApiError = new Error('Validation failed');
      error.statusCode = 422;
      throw error;
    }

    const { token, password } = req.body;

    // In a real implementation, you would:
    // 1. Verify the token exists and hasn't expired
    // 2. Find the user associated with the token
    // 3. Update their password
    // 4. Remove the used token

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    next(error);
  }
};