import { apiClient } from './api';
import { LoginResponse, ApiResponse } from '../types';

export const authService = {
  /**
   * Login - CALL BACKEND REAL API
   */
  login: async (
    username: string,
    password: string
  ): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<{
        access_token: string;
        token_type: string;
        role_id: number;
      }>('/login', {
        email: username, 
        password,
      });

      const role = response.role_id === 1 ? 'admin' : 'user';
      const token = response.access_token;

      // Lưu token & role
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);

      return {
        success: true,
        token,
        role,
        employee: null, 
        message: 'Đăng nhập thành công',
      };
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error('Đăng nhập thất bại');
    }
  },

  /**
   * Logout
   */
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  },

  /**
   * Change password - CALL BACKEND
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<null>> => {
    const res: ApiResponse<null> = await apiClient.post(
      '/auth/change-password',
      {
        currentPassword,
        newPassword,
      }
    );

    if (!res.success) {
      throw new Error(res.message || 'Đổi mật khẩu thất bại');
    }

    return res;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return Boolean(localStorage.getItem('authToken'));
  },

  /**
   * Get current user role
   */
  getUserRole: (): 'admin' | 'user' | null => {
    return localStorage.getItem('userRole') as 'admin' | 'user' | null;
  },

  /**
   * Check if current user is admin
   */
  isAdmin: (): boolean => {
    return localStorage.getItem('userRole') === 'admin';
  },
};
