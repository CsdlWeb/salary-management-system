import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { EmployeeProfile } from "./EmployeeProfile";
import { SalaryInfo } from "./SalaryInfo";
import { PaymentHistory } from "./PaymentHistory";
import { ChangePassword } from "./ChangePassword";
import { Notifications } from "./Notifications";
import { LogOut, User, DollarSign, History, Lock, Bell } from "lucide-react";
import { Employee, Salary, PaymentRecord, Notification } from "../types";

interface EmployeeDashboardProps {
  employee: Employee;
  salary: Salary;
  paymentHistory: PaymentRecord[];
  notifications: Notification[];
  onLogout: () => void;
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
}

export function EmployeeDashboard({
  employee,
  salary,
  paymentHistory,
  notifications,
  onLogout,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
}: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [notificationList, setNotificationList] = useState(notifications);

  // Update notification list when prop changes
  useEffect(() => {
    setNotificationList(notifications);
  }, [notifications]);

  const unreadCount = notificationList.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    onMarkNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllNotificationsAsRead();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl text-white">Hệ Thống Quản Lý Nhân Viên</h1>
              <p className="text-sm text-indigo-100 mt-1">Xin chào, {employee.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="relative bg-white/10 border-white/20 hover:bg-white/20 text-white"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-3xl grid-cols-5 bg-white shadow-md">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Hồ Sơ</span>
            </TabsTrigger>
            <TabsTrigger value="salary" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Bảng Lương</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch Sử</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Thông Báo</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs sm:relative sm:top-0 sm:right-0 sm:ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Mật Khẩu</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile">
              <EmployeeProfile employee={employee} />
            </TabsContent>

            <TabsContent value="salary">
              <SalaryInfo salary={salary} />
            </TabsContent>

            <TabsContent value="history">
              <PaymentHistory payments={paymentHistory} />
            </TabsContent>

            <TabsContent value="notifications">
              <Notifications 
                notifications={notificationList} 
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </TabsContent>

            <TabsContent value="password">
              <ChangePassword />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}