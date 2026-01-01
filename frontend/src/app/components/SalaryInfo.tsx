import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, TrendingUp, PiggyBank, FileText } from "lucide-react";
import { Salary } from "../types";

interface SalaryInfoProps {
  salary: Salary;
}

export function SalaryInfo({ salary }: SalaryInfoProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Lương cơ bản</p>
                <p className="text-xl mt-1">{formatCurrency(salary.baseSalary)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Phụ cấp</p>
                <p className="text-xl mt-1">{formatCurrency(salary.allowances)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">Thưởng</p>
                <p className="text-xl mt-1">{formatCurrency(salary.bonus)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Khấu trừ</p>
                <p className="text-xl mt-1">{formatCurrency(salary.deductions)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle>Chi Tiết Lương</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Lương cơ bản</span>
              <span>{formatCurrency(salary.baseSalary)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Phụ cấp (ăn trưa, xăng xe, điện thoại)</span>
              <span className="text-green-600">+ {formatCurrency(salary.allowances)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Thưởng hiệu suất</span>
              <span className="text-green-600">+ {formatCurrency(salary.bonus)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Khấu trừ (BHXH, BHYT, thuế TNCN)</span>
              <span className="text-red-600">- {formatCurrency(salary.deductions)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 bg-indigo-50 p-4 rounded-lg">
              <span className="text-lg">Lương thực nhận</span>
              <span className="text-xl text-indigo-600">{formatCurrency(salary.netSalary)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}