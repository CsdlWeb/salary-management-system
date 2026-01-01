# Hướng Dẫn Tích Hợp API

## 📁 Cấu Trúc Dự Án

```
/src/app/
├── components/          # UI Components
├── services/           # API Service Layer
│   ├── api.ts         # Base API configuration
│   ├── authService.ts # Authentication APIs
│   └── employeeService.ts # Employee related APIs
├── types/             # TypeScript interfaces
│   └── index.ts
└── App.tsx            # Main application
```

## 🔧 Cấu Hình API

### 1. Cấu hình Base URL

Mở file `/src/app/services/api.ts` và thay đổi `API_BASE_URL`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-endpoint.com/api';
```

Hoặc tạo file `.env` trong thư mục root:

```env
REACT_APP_API_URL=https://your-backend-api.com/api
```

### 2. Authentication Token

Token được lưu tự động trong `localStorage` khi đăng nhập thành công. Mỗi request sẽ tự động gửi kèm header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 📡 API Endpoints Cần Implement

### Authentication APIs (`authService.ts`)

#### 1. Login
```
POST /auth/login
Request Body:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "token": "jwt-token-here",
  "message": "Login successful",
  "employee": {
    "id": "string",
    "name": "string",
    ...
  }
}
```

#### 2. Logout
```
POST /auth/logout
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 3. Change Password
```
POST /auth/change-password
Headers: Authorization: Bearer {token}
Request Body:
{
  "currentPassword": "string",
  "newPassword": "string"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Employee APIs (`employeeService.ts`)

#### 1. Get Employee Profile
```
GET /employee/profile
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "string",
    "employeeCode": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "dateOfBirth": "DD/MM/YYYY",
    "address": "string",
    "position": "string",
    "department": "string",
    "startDate": "DD/MM/YYYY",
    "avatar": "url (optional)"
  }
}
```

#### 2. Get Salary Information
```
GET /employee/salary
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "baseSalary": 20000000,
    "allowances": 3000000,
    "bonus": 5000000,
    "deductions": 2500000,
    "netSalary": 25500000
  }
}
```

#### 3. Get Payment History
```
GET /employee/payment-history
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "month": "12",
      "year": 2024,
      "baseSalary": 20000000,
      "allowances": 3000000,
      "bonus": 5000000,
      "deductions": 2500000,
      "netSalary": 25500000,
      "paidDate": "DD/MM/YYYY HH:mm",
      "status": "paid" | "pending" | "processing"
    }
  ]
}
```

#### 4. Get Notifications
```
GET /employee/notifications
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "message": "string",
      "type": "info" | "warning" | "success" | "error",
      "date": "DD/MM/YYYY HH:mm",
      "isRead": false
    }
  ]
}
```

#### 5. Mark Notification as Read
```
PUT /employee/notifications/{id}/read
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### 6. Mark All Notifications as Read
```
PUT /employee/notifications/read-all
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

## 🔒 Error Handling

API Service tự động xử lý lỗi. Nếu có lỗi, sẽ throw exception với message:

```typescript
try {
  const data = await employeeService.getProfile();
} catch (error) {
  // Error được hiển thị tự động qua toast notification
  console.error('API Error:', error);
}
```

## 🧪 Testing APIs

### Sử dụng Postman/Insomnia

1. Import các endpoints trên
2. Test từng endpoint với dữ liệu mẫu
3. Kiểm tra response format khớp với TypeScript types

### Example với cURL:

```bash
# Login
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Get Profile (cần token từ login response)
curl -X GET https://your-api.com/api/employee/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Lưu Ý

1. **CORS**: Backend phải enable CORS cho frontend domain
2. **Token Expiration**: Implement token refresh nếu cần
3. **Error Codes**: Sử dụng HTTP status codes chuẩn:
   - 200: Success
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Internal Server Error

4. **Date Format**: Tất cả dates sử dụng format `DD/MM/YYYY` hoặc `DD/MM/YYYY HH:mm`
5. **Currency**: Tất cả số tiền là VND (Vietnamese Dong)

## 🚀 Deploy

Khi deploy lên production:

1. Thay đổi `API_BASE_URL` trong file `.env`
2. Đảm bảo HTTPS được enable
3. Kiểm tra CORS settings
4. Test tất cả endpoints trước khi go-live

## 📞 Support

Nếu cần hỗ trợ, vui lòng cung cấp:
- API endpoint đang gọi
- Request body/parameters
- Response nhận được
- Error message (nếu có)
