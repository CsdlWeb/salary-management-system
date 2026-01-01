import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Users } from 'lucide-react';
import { adminService } from '../services/adminService';
import { Department } from '../types';
import { toast } from 'sonner';

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    manager: '',
    description: '',
    employeeCount: 0
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDepartments();
      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu phòng ban');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    setFormData({
      code: '',
      name: '',
      manager: '',
      description: '',
      employeeCount: 0
    });
    setShowModal(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      code: department.code,
      name: department.name,
      manager: department.manager,
      description: department.description || '',
      employeeCount: department.employeeCount
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) return;

    try {
      const response = await adminService.deleteDepartment(id);
      if (response.success) {
        toast.success('Xóa phòng ban thành công');
        loadDepartments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa phòng ban');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDepartment) {
        const response = await adminService.updateDepartment(editingDepartment.id, formData);
        if (response.success) {
          toast.success('Cập nhật phòng ban thành công');
        }
      } else {
        const response = await adminService.createDepartment(formData);
        if (response.success) {
          toast.success('Thêm phòng ban thành công');
        }
      }

      setShowModal(false);
      loadDepartments();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Quản Lý Phòng Ban
          </h1>
          <p className="text-gray-600 mt-1">Thêm, sửa, xóa thông tin phòng ban</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Thêm Phòng Ban
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã phòng ban, trưởng phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div key={department.id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-mono rounded-lg">
                    {department.code}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{department.name}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(department)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Sửa"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(department.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span className="text-sm">
                  <span className="font-semibold text-gray-900">{department.employeeCount}</span> nhân viên
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Trưởng phòng:</p>
                <p className="font-medium">{department.manager}</p>
              </div>

              {department.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mô tả:</p>
                  <p className="text-sm text-gray-600">{department.description}</p>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Ngày tạo: {department.createdDate}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <p className="text-gray-500">Không tìm thấy phòng ban nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingDepartment ? 'Chỉnh Sửa Phòng Ban' : 'Thêm Phòng Ban Mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mã Phòng Ban *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: IT, HR, ACC..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tên Phòng Ban *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Phòng Công Nghệ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Trưởng Phòng *</label>
                <input
                  type="text"
                  required
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Họ tên trưởng phòng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô Tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả ngắn về phòng ban..."
                />
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
                  {editingDepartment ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
