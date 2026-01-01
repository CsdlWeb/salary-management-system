import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, DollarSign } from 'lucide-react';
import { adminService } from '../services/adminService';
import { PayrollEntry, AdminEmployee } from '../types';
import { toast } from 'sonner';

export function PayrollManagement() {
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollEntry | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    month: '',
    year: new Date().getFullYear(),
    baseSalary: 0,
    allowances: 0,
    bonus: 0,
    deductions: 0,
    status: 'draft' as 'draft' | 'approved' | 'paid'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payrollRes, empRes] = await Promise.all([
        adminService.getPayroll(),
        adminService.getEmployees()
      ]);
      
      if (payrollRes.success && payrollRes.data) setPayroll(payrollRes.data);
      if (empRes.success && empRes.data) setEmployees(empRes.data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNetSalary = () => {
    return formData.baseSalary + formData.allowances + formData.bonus - formData.deductions;
  };

  const handleAdd = () => {
    setEditingPayroll(null);
    setFormData({
      employeeId: '',
      month: String(new Date().getMonth() + 1),
      year: new Date().getFullYear(),
      baseSalary: 0,
      allowances: 0,
      bonus: 0,
      deductions: 0,
      status: 'draft'
    });
    setShowModal(true);
  };

  const handleEdit = (entry: PayrollEntry) => {
    setEditingPayroll(entry);
    setFormData({
      employeeId: entry.employeeId,
      month: entry.month,
      year: entry.year,
      baseSalary: entry.baseSalary,
      allowances: entry.allowances,
      bonus: entry.bonus,
      deductions: entry.deductions,
      status: entry.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bảng lương này?')) return;

    try {
      const response = await adminService.deletePayroll(id);
      if (response.success) {
        toast.success('Xóa bảng lương thành công');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa bảng lương');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const employee = employees.find(emp => emp.id === formData.employeeId);
      if (!employee) {
        toast.error('Vui lòng chọn nhân viên');
        return;
      }

      const netSalary = calculateNetSalary();
      const payrollData = {
        ...formData,
        employeeName: employee.name,
        employeeCode: employee.employeeCode,
        department: employee.department,
        netSalary,
        paidDate: formData.status === 'paid' ? new Date().toLocaleDateString('vi-VN') : undefined
      };

      if (editingPayroll) {
        const response = await adminService.updatePayroll(editingPayroll.id, payrollData);
        if (response.success) {
          toast.success('Cập nhật bảng lương thành công');
        }
      } else {
        const response = await adminService.createPayroll(payrollData);
        if (response.success) {
          toast.success('Thêm bảng lương thành công');
        }
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const filteredPayroll = payroll.filter(entry =>
    entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      approved: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700'
    };
    const labels = {
      draft: 'Nháp',
      approved: 'Đã duyệt',
      paid: 'Đã trả'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quản Lý Bảng Lương
          </h1>
          <p className="text-gray-600 mt-1">Thêm, sửa, xóa bảng lương nhân viên</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Thêm Bảng Lương
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã nhân viên, phòng ban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Mã NV</th>
                <th className="px-6 py-4 text-left font-semibold">Họ Tên</th>
                <th className="px-6 py-4 text-left font-semibold">Phòng Ban</th>
                <th className="px-6 py-4 text-left font-semibold">Tháng/Năm</th>
                <th className="px-6 py-4 text-right font-semibold">Lương CB</th>
                <th className="px-6 py-4 text-right font-semibold">Phụ Cấp</th>
                <th className="px-6 py-4 text-right font-semibold">Thưởng</th>
                <th className="px-6 py-4 text-right font-semibold">Khấu Trừ</th>
                <th className="px-6 py-4 text-right font-semibold">Thực Lĩnh</th>
                <th className="px-6 py-4 text-left font-semibold">Trạng Thái</th>
                <th className="px-6 py-4 text-center font-semibold">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayroll.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">{entry.employeeCode}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{entry.employeeName}</td>
                  <td className="px-6 py-4 text-sm">{entry.department}</td>
                  <td className="px-6 py-4 text-sm">{entry.month}/{entry.year}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    {formatCurrency(entry.baseSalary)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {formatCurrency(entry.allowances)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-600">
                    +{formatCurrency(entry.bonus)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-red-600">
                    -{formatCurrency(entry.deductions)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {formatCurrency(entry.netSalary)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(entry.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayroll.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không tìm thấy bảng lương nào
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingPayroll ? 'Chỉnh Sửa Bảng Lương' : 'Thêm Bảng Lương Mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Nhân Viên *</label>
                  <select
                    required
                    value={formData.employeeId}
                    onChange={(e) => {
                      const emp = employees.find(emp => emp.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        employeeId: e.target.value,
                        baseSalary: emp?.salary || 0
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} - {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tháng *</label>
                  <select
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn tháng</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={String(month)}>Tháng {month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Năm *</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lương Cơ Bản (VND) *</label>
                  <input
                    type="number"
                    required
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phụ Cấp (VND)</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thưởng (VND)</label>
                  <input
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Khấu Trừ (VND)</label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trạng Thái *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Nháp</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="paid">Đã trả</option>
                  </select>
                </div>

                <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Thực Lĩnh:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(calculateNetSalary())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  {editingPayroll ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
