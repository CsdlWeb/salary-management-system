// Types for the application
export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  position: string;
  department: string;
  startDate: string;
  avatar?: string;
}

export interface Salary {
  baseSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  netSalary: number;
}

export interface PaymentRecord {
  id: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paidDate: string;
  status: 'paid' | 'pending' | 'processing';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  isRead: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  employee?: Employee;
  role?: 'admin' | 'user';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Admin types
export interface Department {
  id: string;
  code: string;
  name: string;
  manager: string;
  employeeCount: number;
  description?: string;
  createdDate: string;
}

export interface AdminEmployee extends Employee {
  departmentId: string;
  salary: number;
  status: 'active' | 'inactive' | 'onleave';
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  createdDate: string;
  paidDate?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalPayroll: number;
  averageSalary: number;
  monthlyChange: {
    employees: number;
    payroll: number;
  };
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}