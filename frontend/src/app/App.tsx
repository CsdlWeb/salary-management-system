import { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { EmployeeDashboard } from "./components/EmployeeDashboard";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./components/AdminDashboard";
import { EmployeeManagement } from "./components/EmployeeManagement";
import { DepartmentManagement } from "./components/DepartmentManagement";
import { PayrollManagement } from "./components/PayrollManagement";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { authService } from "./services/authService";
import { employeeService } from "./services/employeeService";
import { Employee, Salary, PaymentRecord, Notification } from "./types";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminTab, setAdminTab] = useState('dashboard');

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const role = authService.getUserRole();
        setIsLoggedIn(true);
        setUserRole(role);
        
        if (role === 'user') {
          await loadEmployeeData();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Load all employee data after login
  const loadEmployeeData = async () => {
    try {
      setIsLoading(true);

      const results = await Promise.allSettled([
        employeeService.getProfile(),
        employeeService.getSalary(),
        employeeService.getPaymentHistory(),
        employeeService.getNotifications(),
      ]);

      if (results[0].status === 'fulfilled') {
        const profileResponse = results[0].value;
        if (profileResponse && profileResponse.success && profileResponse.data) {
          setEmployee(profileResponse.data);
        } else {
          const errorMsg = profileResponse?.message || profileResponse?.error || 'Không thể tải thông tin hồ sơ. Vui lòng kiểm tra employee_id trong bảng users có khớp với employees không.';
          toast.error(errorMsg);
        }
      } else if (results[0].status === 'rejected') {
        const error = results[0].reason;
        const errorMsg = error?.message || 'Lỗi khi tải thông tin hồ sơ. Vui lòng kiểm tra employee_id trong bảng users.';
        toast.error(errorMsg);
      }

      if (results[1].status === 'fulfilled') {
        const salaryResponse = results[1].value;
        if (salaryResponse && salaryResponse.success && salaryResponse.data) {
          setSalary(salaryResponse.data);
        }
      }

      if (results[2].status === 'fulfilled') {
        const historyResponse = results[2].value;
        if (historyResponse && historyResponse.success && historyResponse.data) {
          setPaymentHistory(historyResponse.data);
        }
      }

      if (results[3].status === 'fulfilled') {
        const notificationsResponse = results[3].value;
        if (notificationsResponse && notificationsResponse.success && notificationsResponse.data) {
          setNotifications(notificationsResponse.data);
        }
      }
    } catch (error: any) {
      toast.error('Lỗi khi tải dữ liệu: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(username, password);

      if (response.success) {
        setIsLoggedIn(true);
        setUserRole(response.role || 'user');
        
        if (response.role === 'admin') {
          toast.success(response.message || "Đăng nhập thành công với quyền Admin!");
        } else {
          toast.success("Đăng nhập thành công!");
          // Load employee data after successful login
          await loadEmployeeData();
        }
      } else {
        toast.error(response.message || "Đăng nhập thất bại!");
      }
    } catch (error: any) {
      toast.error(error.message || "Tên đăng nhập hoặc mật khẩu không đúng!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUserRole(null);
      setEmployee(null);
      setSalary(null);
      setPaymentHistory([]);
      setNotifications([]);
      setAdminTab('dashboard');
      toast.info("Đã đăng xuất");
    } catch (error) {
      setIsLoggedIn(false);
      setUserRole(null);
      toast.info("Đã đăng xuất");
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await employeeService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await employeeService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    } catch (error) {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  // Show loading screen
  if (isLoading && isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} isLoading={isLoading} />
      ) : userRole === 'admin' ? (
        <AdminLayout
          currentTab={adminTab}
          onTabChange={setAdminTab}
          onLogout={handleLogout}
        >
          {adminTab === 'dashboard' && <AdminDashboard />}
          {adminTab === 'employees' && <EmployeeManagement />}
          {adminTab === 'departments' && <DepartmentManagement />}
          {adminTab === 'payroll' && <PayrollManagement />}
        </AdminLayout>
      ) : (
        <EmployeeDashboard
          employee={employee}
          salary={salary}
          paymentHistory={paymentHistory}
          notifications={notifications}
          onLogout={handleLogout}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        />
      )}
      <Toaster />
    </>
  );
}