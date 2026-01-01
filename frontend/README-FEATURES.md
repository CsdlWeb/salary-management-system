# 🚀 Hệ Thống Quản Lý Nhân Viên

Hệ thống quản lý nhân viên toàn diện với giao diện admin và user, bao gồm CRUD đầy đủ, dashboard thống kê với biểu đồ và phân quyền.

## ✨ Tính Năng Chính

### 👤 Giao Diện Nhân Viên (User)
- ✅ Xem hồ sơ cá nhân
- ✅ Xem bảng lương hiện tại
- ✅ Lịch sử trả lương
- ✅ Đổi mật khẩu với thanh đo độ mạnh
- ✅ Hệ thống thông báo với badge

### 👨‍💼 Giao Diện Quản Trị (Admin)
- ✅ **Dashboard Thống Kê** với biểu đồ:
  - Biểu đồ tròn: Nhân viên theo phòng ban
  - Biểu đồ cột: Tổng lương theo phòng ban
  - Biểu đồ đường: Lương theo tháng
  - Các chỉ số thống kê tổng quan
  
- ✅ **Quản Lý Nhân Viên (CRUD)**:
  - Thêm/Sửa/Xóa nhân viên
  - Tìm kiếm nhân viên
  - Quản lý trạng thái (Đang làm/Nghỉ việc/Nghỉ phép)
  - Upload avatar
  
- ✅ **Quản Lý Phòng Ban (CRUD)**:
  - Thêm/Sửa/Xóa phòng ban
  - Hiển thị số lượng nhân viên
  - Quản lý trưởng phòng
  
- ✅ **Quản Lý Bảng Lương (CRUD)**:
  - Tạo/Sửa/Xóa bảng lương
  - Tính toán tự động lương thực lĩnh
  - Quản lý trạng thái (Nháp/Đã duyệt/Đã trả)
  - Filter theo tháng/năm

## 🎨 Giao Diện

- 🎨 Design hiện đại với gradient xanh dương/tím
- 📱 Responsive trên mọi thiết bị
- 🌈 Loading states và error handling
- 🔔 Toast notifications
- 📊 Charts với Recharts

## 🔐 Tài Khoản Demo

### Administrator (Toàn quyền)
```
Username: admin
Password: admin123
```

**Quyền hạn:**
- Quản lý nhân viên, phòng ban, bảng lương
- Xem dashboard thống kê với biểu đồ
- CRUD đầy đủ tất cả dữ liệu

### User (Nhân viên)
```
Username: user
Password: user123
```

**Quyền hạn:**
- Xem hồ sơ cá nhân
- Xem bảng lương và lịch sử thanh toán
- Nhận và quản lý thông báo
- Đổi mật khẩu

## 📂 Cấu Trúc Dự Án

```
/src/app/
├── components/
│   ├── AdminDashboard.tsx          # Dashboard thống kê với charts
│   ├── EmployeeManagement.tsx      # CRUD nhân viên
│   ├── DepartmentManagement.tsx    # CRUD phòng ban
│   ├── PayrollManagement.tsx       # CRUD bảng lương
│   ├── AdminLayout.tsx             # Layout cho admin
│   ├── EmployeeDashboard.tsx       # Dashboard cho nhân viên
│   ├── LoginForm.tsx               # Form đăng nhập
│   └── ui/                         # UI Components
├── services/
│   ├── api.ts                      # Base API client
│   ├── authService.ts              # Authentication với role
│   ├── employeeService.ts          # Employee services
│   └── adminService.ts             # Admin services (CRUD)
├── types/
│   └── index.ts                    # TypeScript interfaces
└── App.tsx                         # Main app với routing
```

## 🛠️ Công Nghệ Sử Dụng

- **Frontend Framework**: React 18 với TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📊 Mock Data

Hệ thống sử dụng mock data để demo:

- **Phòng ban**: 4 phòng ban (IT, HR, Kế Toán, Marketing)
- **Nhân viên**: 5 nhân viên mẫu
- **Bảng lương**: 3 entries với các trạng thái khác nhau
- **Thông báo**: 5 thông báo cho user

## 🚀 Cách Sử Dụng

1. **Đăng nhập**:
   - Chọn tài khoản Admin hoặc User
   - Click vào card tài khoản để điền tự động
   - Hoặc nhập thủ công

2. **Admin Panel**:
   - Dashboard: Xem thống kê và biểu đồ
   - Nhân Viên: Quản lý danh sách nhân viên
   - Phòng Ban: Quản lý phòng ban
   - Bảng Lương: Quản lý lương nhân viên

3. **User Panel**:
   - Tab Hồ Sơ: Xem thông tin cá nhân
   - Tab Bảng Lương: Xem lương hiện tại
   - Tab Lịch Sử: Xem lịch sử trả lương
   - Tab Đổi MK: Đổi mật khẩu
   - Icon chuông: Xem thông báo

## 🔄 Tích Hợp API Thực

Để kết nối với backend thật:

1. Mở `/src/app/services/api.ts`
2. Thay đổi `API_BASE_URL`
3. Xem file `README-API.md` để biết format API cần implement

## 📝 Notes

- Demo data được lưu trong memory, refresh sẽ reset
- Khi đăng xuất, tất cả state được clear
- Admin và User có giao diện hoàn toàn khác nhau
- Responsive trên mobile, tablet, desktop

## 🎯 Tính Năng Nổi Bật

1. **Phân quyền rõ ràng**: Admin và User có giao diện riêng biệt
2. **CRUD hoàn chỉnh**: Create, Read, Update, Delete cho tất cả entities
3. **Dashboard thống kê**: 4 loại biểu đồ khác nhau
4. **Real-time updates**: UI cập nhật ngay sau mỗi action
5. **Error handling**: Toast notifications cho mọi action
6. **Loading states**: Spinner khi đang xử lý
7. **Search & Filter**: Tìm kiếm trong tất cả tables

## 📱 Responsive Design

- Desktop: Full sidebar + content
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu + overlay

## 🎨 UI/UX Features

- Gradient colors (blue to purple)
- Smooth transitions
- Hover effects
- Modal dialogs
- Badge notifications
- Status indicators
- Interactive charts

---

**Developed with ❤️ using React + TypeScript + Tailwind CSS**
