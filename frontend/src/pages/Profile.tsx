import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface ProfileFormData {
  username: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });
  
  const newPassword = watch('newPassword');

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    
    try {
      // Password validation if changing password
      if (isChangingPassword) {
        if (!data.currentPassword) {
          toast.error('Current password is required');
          setIsSubmitting(false);
          return;
        }
        
        if (data.newPassword !== data.confirmPassword) {
          toast.error('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
      }
      
      const profileData: Partial<User> = {
        username: data.username,
      };
      
      // Add password change data if needed
      const passwordData = isChangingPassword ? {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      } : {};
      
      const success = await updateUserData({
        ...profileData,
        ...passwordData,
      });
      
      if (success) {
        if (isChangingPassword) {
          setIsChangingPassword(false);
          reset({ ...data, currentPassword: '', newPassword: '', confirmPassword: '' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        <p className="text-gray-400">View and update your account information</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-700 to-secondary-700 rounded-full flex items-center justify-center mr-4">
            <span className="text-3xl font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-white">{user?.username}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Member since {new Date(user?.createdAt || '').toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="label flex items-center">
                <UserIcon className="h-4 w-4 mr-2" /> Username
              </label>
              <input
                id="username"
                type="text"
                className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && (
                <p className="error-message">{errors.username.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="label flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" /> Email
              </label>
              <input
                id="email"
                type="email"
                className="input-field bg-dark-800 opacity-70 cursor-not-allowed"
                {...register('email')}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed for security reasons
              </p>
            </div>
            
            <div className="border-t border-dark-500 pt-6">
              <button
                type="button"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="text-primary-400 hover:text-primary-300 flex items-center text-sm mb-4"
              >
                <KeyIcon className="h-4 w-4 mr-2" />
                {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
              </button>
              
              {isChangingPassword && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="label">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      className={`input-field ${errors.currentPassword ? 'border-red-500' : ''}`}
                      {...register('currentPassword', {
                        required: 'Current password is required',
                      })}
                    />
                    {errors.currentPassword && (
                      <p className="error-message">{errors.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="label">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      className={`input-field ${errors.newPassword ? 'border-red-500' : ''}`}
                      {...register('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      })}
                    />
                    {errors.newPassword && (
                      <p className="error-message">{errors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="label">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value =>
                          value === newPassword || 'The passwords do not match',
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="error-message">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Account Security</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-dark-500">
            <div>
              <h3 className="font-medium text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <button className="btn-secondary text-sm">
              Enable
            </button>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-dark-500">
            <div>
              <h3 className="font-medium text-white">Active Sessions</h3>
              <p className="text-sm text-gray-400">Manage your active login sessions</p>
            </div>
            <button className="btn-secondary text-sm">
              Manage
            </button>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium text-red-400">Delete Account</h3>
              <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button className="btn-danger text-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;