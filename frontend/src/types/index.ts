export interface User {
  id: string;
  email: string;
  username: string;
  profileImage?: string;
  balance: number;
  createdAt: string;
  isVerified: boolean;
  lastLogin: string;
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  REWARD = 'reward'
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  reference?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  recipientId?: string;
  recipientUsername?: string;
}

export interface Transfer {
  recipientId: string;
  recipientUsername?: string;
  amount: number;
  description?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export interface RewardOption {
  id: number;
  value: number;
  probability: number;
}

export enum NotificationType {
  TRANSACTION = 'transaction',
  TRANSFER = 'transfer',
  REWARD = 'reward',
  SECURITY = 'security'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string; // ID of related transaction/reward
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}