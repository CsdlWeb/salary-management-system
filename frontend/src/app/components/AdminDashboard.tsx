import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Building2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { adminService } from '../services/adminService';
import { DashboardStats, ChartData } from '../types';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salaryByDept, setSalaryByDept] = useState<ChartData[]>([]);
  const [employeesByDept, setEmployeesByDept] = useState<ChartData[]>([]);
  const [monthlyPayroll, setMonthlyPayroll] = useState<ChartData[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, salaryRes, employeesRes, payrollRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getSalaryByDepartment(),
        adminService.getEmployeesByDepartment(),
        adminService.getMonthlyPayroll()
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (salaryRes.success && salaryRes.data) setSalaryByDept(salaryRes.data);
      if (employeesRes.success && employeesRes.data) setEmployeesByDept(employeesRes.data);
      if (payrollRes.success && payrollRes.data) setMonthlyPayroll(payrollRes.data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu thống kê');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Quản Trị
        </h1>
        <p className="text-gray-600 mt-1">Tổng quan về nhân viên, phòng ban và bảng lương</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Tổng Nhân Viên</p>
                <p className="text-3xl font-bold mt-2">{stats.totalEmployees}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+{stats.monthlyChange.employees}%</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Phòng Ban</p>
                <p className="text-3xl font-bold mt-2">{stats.totalDepartments}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm">Đang hoạt động</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Building2 className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Tổng Lương Tháng</p>
                <p className="text-2xl font-bold mt-2">{formatNumber(stats.totalPayroll / 1000000)}M</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+{stats.monthlyChange.payroll}%</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Lương Trung Bình</p>
                <p className="text-2xl font-bold mt-2">{formatNumber(stats.averageSalary / 1000000)}M</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm">VND/tháng</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payroll Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Tổng Lương Theo Tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPayroll}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Tổng Lương"
                dot={{ fill: '#3b82f6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Employees by Department Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Nhân Viên Theo Phòng Ban</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={employeesByDept}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {employeesByDept.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Salary by Department Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-md lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Tổng Lương Theo Phòng Ban</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salaryByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="value" name="Tổng Lương" radius={[8, 8, 0, 0]}>
                {salaryByDept.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Thao Tác Nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white hover:bg-gray-50 px-6 py-4 rounded-xl shadow-sm transition-all text-left">
            <p className="font-semibold">Thêm Nhân Viên Mới</p>
            <p className="text-sm text-gray-600 mt-1">Tạo hồ sơ nhân viên mới</p>
          </button>
          <button className="bg-white hover:bg-gray-50 px-6 py-4 rounded-xl shadow-sm transition-all text-left">
            <p className="font-semibold">Tạo Bảng Lương</p>
            <p className="text-sm text-gray-600 mt-1">Lập bảng lương tháng mới</p>
          </button>
          <button className="bg-white hover:bg-gray-50 px-6 py-4 rounded-xl shadow-sm transition-all text-left">
            <p className="font-semibold">Quản Lý Phòng Ban</p>
            <p className="text-sm text-gray-600 mt-1">Thêm/sửa phòng ban</p>
          </button>
        </div>
      </div>
    </div>
  );
}
