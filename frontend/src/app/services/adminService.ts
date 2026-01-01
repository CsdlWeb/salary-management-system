import { apiClient } from './api';
import {
  Department,
  AdminEmployee,
  PayrollEntry,
  DashboardStats,
  ChartData,
  ApiResponse
} from '../types';

export const adminService = {
  // ========== DASHBOARD ==========
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiClient.get('/admin/dashboard/stats');
  },

  getSalaryByDepartment: async (): Promise<ApiResponse<ChartData[]>> => {
    return apiClient.get('/admin/dashboard/salary-by-department');
  },

  getEmployeesByDepartment: async (): Promise<ApiResponse<ChartData[]>> => {
    return apiClient.get('/admin/dashboard/employees-by-department');
  },

  getMonthlyPayroll: async (): Promise<ApiResponse<ChartData[]>> => {
    return apiClient.get('/admin/dashboard/monthly-payroll');
  },

  // ========== DEPARTMENTS ==========
  getDepartments: async (): Promise<ApiResponse<Department[]>> => {
    return apiClient.get('/admin/departments');
  },

  getDepartment: async (id: string): Promise<ApiResponse<Department>> => {
    return apiClient.get(`/admin/departments/${id}`);
  },

  createDepartment: async (
    dept: Omit<Department, 'id' | 'createdDate'>
  ): Promise<ApiResponse<Department>> => {
    return apiClient.post('/admin/departments', dept);
  },

  updateDepartment: async (
    id: string,
    dept: Partial<Department>
  ): Promise<ApiResponse<Department>> => {
    return apiClient.put(`/admin/departments/${id}`, dept);
  },

  deleteDepartment: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/departments/${id}`);
  },

  // ========== EMPLOYEES ==========
  getEmployees: async (): Promise<ApiResponse<AdminEmployee[]>> => {
    return apiClient.get('/admin/employees');
  },

  getEmployee: async (id: string): Promise<ApiResponse<AdminEmployee>> => {
    return apiClient.get(`/admin/employees/${id}`);
  },

  createEmployee: async (
    emp: Omit<AdminEmployee, 'id' | 'employeeCode'>
  ): Promise<ApiResponse<AdminEmployee>> => {
    return apiClient.post('/admin/employees', emp);
  },

  updateEmployee: async (
    id: string,
    emp: Partial<AdminEmployee>
  ): Promise<ApiResponse<AdminEmployee>> => {
    return apiClient.put(`/admin/employees/${id}`, emp);
  },

  deleteEmployee: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/employees/${id}`);
  },

  // ========== PAYROLL ==========
  getPayroll: async (): Promise<ApiResponse<PayrollEntry[]>> => {
    return apiClient.get('/admin/payroll');
  },

  getPayrollEntry: async (id: string): Promise<ApiResponse<PayrollEntry>> => {
    return apiClient.get(`/admin/payroll/${id}`);
  },

  createPayroll: async (
    entry: Omit<PayrollEntry, 'id' | 'createdDate'>
  ): Promise<ApiResponse<PayrollEntry>> => {
    return apiClient.post('/admin/payroll', entry);
  },

  updatePayroll: async (
    id: string,
    entry: Partial<PayrollEntry>
  ): Promise<ApiResponse<PayrollEntry>> => {
    return apiClient.put(`/admin/payroll/${id}`, entry);
  },

  deletePayroll: async (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/admin/payroll/${id}`);
  }
};
