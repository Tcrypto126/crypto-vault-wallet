import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { ApiError } from '../middlewares/errorHandler';

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: ApiError = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      const error: ApiError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const { username, full_name } = req.body;

    const updatedUser = await UserModel.updateProfile(req.user.id, {
      username,
      full_name
    });

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        full_name: updatedUser.full_name,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
};