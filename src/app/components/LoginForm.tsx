import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Lock, User, ShieldCheck, UserCircle } from "lucide-react";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  isLoading?: boolean;
}

export function LoginForm({ onLogin, isLoading = false }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const quickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Form */}
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Đăng Nhập Hệ Thống</CardTitle>
            <CardDescription className="text-center">
              Nhập thông tin đăng nhập của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng Nhập"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-center">🚀 Demo Accounts</CardTitle>
            <CardDescription className="text-center">
              Nhấp vào tài khoản để đăng nhập nhanh
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Admin Account */}
            <button
              onClick={() => quickLogin('admin', 'admin123')}
              className="w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-500 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-purple-600">Administrator</h3>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Admin</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Toàn quyền quản trị hệ thống</p>
                  <div className="flex flex-col gap-1 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <code className="bg-gray-100 px-2 py-0.5 rounded">admin</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      <code className="bg-gray-100 px-2 py-0.5 rounded">admin123</code>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    ✅ Quản lý nhân viên, phòng ban, bảng lương<br/>
                    ✅ Xem dashboard thống kê với biểu đồ<br/>
                    ✅ CRUD đầy đủ tất cả dữ liệu
                  </div>
                </div>
              </div>
            </button>

            {/* User Account */}
            <button
              onClick={() => quickLogin('user', 'user123')}
              className="w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-blue-600">Nhân Viên</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">User</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Xem thông tin cá nhân và lương</p>
                  <div className="flex flex-col gap-1 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <code className="bg-gray-100 px-2 py-0.5 rounded">user</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      <code className="bg-gray-100 px-2 py-0.5 rounded">user123</code>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    ✅ Xem hồ sơ cá nhân<br/>
                    ✅ Xem bảng lương và lịch sử thanh toán<br/>
                    ✅ Nhận và quản lý thông báo
                  </div>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}