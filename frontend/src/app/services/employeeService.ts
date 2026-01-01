import { apiClient } from './api';
import {
  Employee,
  Salary,
  PaymentRecord,
  Notification,
  ApiResponse
} from '../types';

export const employeeService = {
  /**
   * Get current employee profile
   */
  getProfile: async (): Promise<ApiResponse<Employee>> => {
    return await apiClient.get('/employee/profile');
  },

  /**
   * Get current employee salary information
   */
  getSalary: async (): Promise<ApiResponse<Salary>> => {
    return await apiClient.get('/employee/salary');
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (): Promise<ApiResponse<PaymentRecord[]>> => {
    return await apiClient.get('/employee/payments');
  },

  /**
   * Get notifications
   */
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    return await apiClient.get('/employee/notifications');
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (
    notificationId: string
  ): Promise<ApiResponse<null>> => {
    return await apiClient.put(
      `/employee/notifications/${notificationId}/read`
    );
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead: async (): Promise<ApiResponse<null>> => {
    return await apiClient.put('/employee/notifications/read-all');
  }
};
