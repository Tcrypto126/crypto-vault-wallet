import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, LoginCredentials, RegisterCredentials, ApiResponse } from '@/types';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
}

type AuthAction =
  | { type: 'INITIALIZE'; payload: { isAuthenticated: boolean; user: User | null } }
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'REGISTER'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { user: Partial<User> } };

interface AuthContextValue extends AuthState {
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserData: (userData: Partial<User>) => Promise<boolean>;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const TOKEN_KEY = 'auth_token';

const reducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        isInitialized: true,
      };
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case 'REGISTER':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload.user } : null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  const initialize = useCallback(async () => {
    try {
      const token = Cookies.get(TOKEN_KEY);

      if (token) {
        // Validate the token and get user data
        const response = await api.get<ApiResponse<User>>('/auth/me');

        if (response.data.success && response.data.data) {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: true,
              user: response.data.data,
            },
          });
        } else {
          // Token is invalid
          Cookies.remove(TOKEN_KEY);
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } else {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      dispatch({
        type: 'INITIALIZE',
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Save the token
        Cookies.set(TOKEN_KEY, token, { expires: 7 });

        dispatch({
          type: 'LOGIN',
          payload: { user },
        });

        toast.success('Logged in successfully');
        return true;
      } else {
        toast.error(response.data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
      return false;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', credentials);

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Save the token
        Cookies.set(TOKEN_KEY, token, { expires: 7 });

        dispatch({
          type: 'REGISTER',
          payload: { user },
        });

        toast.success('Account created successfully');
        return true;
      } else {
        toast.error(response.data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove(TOKEN_KEY);
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateUserData = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await api.put<ApiResponse<User>>('/users/profile', userData);

      if (response.data.success && response.data.data) {
        dispatch({
          type: 'UPDATE_USER',
          payload: { user: response.data.data },
        });

        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(response.data.message || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('Failed to update profile. Please try again.');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        initialize,
        login,
        register,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};