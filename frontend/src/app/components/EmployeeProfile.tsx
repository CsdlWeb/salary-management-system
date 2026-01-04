import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, Phone, Calendar, Building, User } from "lucide-react";
import { Employee } from "../types";

interface EmployeeProfileProps {
  employee: Employee;
}

export function EmployeeProfile({ employee }: EmployeeProfileProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle>Thông Tin Cá Nhân</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex justify-center md:justify-start">
              <Avatar className="w-32 h-32">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700">
                  {employee.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl mb-1">{employee.name}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Mã nhân viên</p>
                    <p>{employee.employeeCode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phòng ban</p>
                    <p>{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p>{employee.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày vào làm</p>
                    <p>{employee.startDate ? new Date(employee.startDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}