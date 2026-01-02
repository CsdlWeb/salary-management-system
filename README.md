# Salary Management System
Backend & Frontend project for company payroll management.

# Hệ thống quản lý lương công ty

## Giới thiệu
Dự án giúp quản lý:
- Nhân viên
- Chấm công
- Tính lương, phụ cấp, khấu trừ
- Xuất báo cáo thống kê
- Tích hợp backend + frontend, phát triển theo Git Flow

## Công nghệ sử dụng
**Backend:** Python, FastAPI, SQLAlchemy, MySQL/PostgreSQL  
**Frontend:** Vite + React (TypeScipt)  
**Quản lý version:** Git + GitHub (Git Flow: main, dev, feature-*)  

## Cấu trúc thư mục

```text
backend/
├─ auth/                  # Folder xử lý login, phân quyền
│  └─ *.py
├─ company_payroll/        # Folder xử lý payroll, allowance, deduction
│  └─ *.py
├─ database.py             # Kết nối database
├─ main.py                 # FastAPI app chính
├─ models.py               # Các bảng SQLAlchemy
├─ requirements.txt        # Thư viện cần cài
├─ schemas.py              # Pydantic schemas

frontend/
├─ guidelines/             # Hướng dẫn
├─ attributions/           # Bản quyền / nguồn
├─ index.html              # File HTML gốc
├─ package.json            # Dependencies node/npm
├─ postcss.config.js       # Cấu hình PostCSS
├─ vite.config.js          # Cấu hình Vite
├─ readme_api.md           # Hướng dẫn API frontend
├─ readme-features.md      # Hướng dẫn chức năng frontend
└─ src/
   ├─ app/                 # Component / module
   ├─ styles/              # CSS / SCSS
   └─ main.js              # Khởi chạy frontend
