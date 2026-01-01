import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Download, CheckCircle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { PaymentRecord } from "../types";

interface PaymentHistoryProps {
  payments: PaymentRecord[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã thanh toán
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            <Clock className="w-3 h-3 mr-1" />
            Đang xử lý
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Chờ xử lý
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle>Lịch Sử Trả Lương</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tháng</TableHead>
                  <TableHead>Năm</TableHead>
                  <TableHead className="text-right">Lương cơ bản</TableHead>
                  <TableHead className="text-right">Phụ cấp</TableHead>
                  <TableHead className="text-right">Thưởng</TableHead>
                  <TableHead className="text-right">Khấu trừ</TableHead>
                  <TableHead className="text-right">Thực nhận</TableHead>
                  <TableHead>Ngày trả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>Tháng {payment.month}</TableCell>
                    <TableCell>{payment.year}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.baseSalary)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(payment.allowances)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(payment.bonus)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(payment.deductions)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payment.netSalary)}
                    </TableCell>
                    <TableCell>{payment.paymentDate}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.status === "paid" && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}