-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 28, 2025 lúc 09:41 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `company_payroll`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `allowances`
--

CREATE TABLE `allowances` (
  `allowance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `month` date NOT NULL,
  `allowance` decimal(15,2) DEFAULT 0.00,
  `bonus` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `month` date NOT NULL,
  `working_days` int(11) DEFAULT NULL CHECK (`working_days` >= 0),
  `overtime_hours` decimal(5,2) DEFAULT 0.00,
  `leave_days` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contracts`
--

CREATE TABLE `contracts` (
  `contract_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `contract_type` enum('Probation','Official','Temporary') NOT NULL,
  `salary` decimal(15,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `deductions`
--

CREATE TABLE `deductions` (
  `deduction_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `month` date NOT NULL,
  `insurance` decimal(15,2) DEFAULT 0.00,
  `tax` decimal(15,2) DEFAULT 0.00,
  `other` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`) VALUES
(3, 'IT'),
(2, 'Kế toán'),
(4, 'Kinh doanh'),
(5, 'Marketing'),
(1, 'Nhân sự');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `department_id` int(11) NOT NULL,
  `position_id` int(11) NOT NULL,
  `hire_date` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `employees`
--

INSERT INTO `employees` (`employee_id`, `full_name`, `email`, `phone`, `department_id`, `position_id`, `hire_date`, `status`) VALUES
(1, 'Nguyễn Minh Tuấn', 'tuan.nguyen@abccompany.vn', '0910000001', 3, 3, '2019-03-12', 'active'),
(2, 'Trần Thị Lan', 'lan.tran@abccompany.vn', '0910000002', 1, 2, '2021-07-01', 'active'),
(3, 'Phạm Quốc Huy', 'huy.pham@abccompany.vn', '0910000003', 2, 4, '2018-11-20', 'active'),
(4, 'Lê Hoàng Anh', 'anh.le@abccompany.vn', '0910000004', 3, 5, '2017-05-10', 'active'),
(5, 'Võ Thanh Tùng', 'tung.vo@abccompany.vn', '0910000005', 4, 3, '2020-02-15', 'active'),
(6, 'Đặng Thu Hà', 'ha.dang@abccompany.vn', '0910000006', 5, 2, '2022-09-01', 'active'),
(7, 'Nguyễn Đức Long', 'long.nguyen@abccompany.vn', '0910000007', 3, 2, '2023-01-10', 'active'),
(8, 'Bùi Ngọc Mai', 'mai.bui@abccompany.vn', '0910000008', 1, 3, '2019-06-18', 'active'),
(9, 'Phan Văn Khải', 'khai.phan@abccompany.vn', '0910000009', 4, 2, '2021-04-22', 'active'),
(10, 'Lý Thị Hồng', 'hong.ly@abccompany.vn', '0910000010', 5, 3, '2020-10-05', 'active'),
(11, 'Đỗ Minh Quân', 'quan.do@abccompany.vn', '0910000011', 3, 4, '2018-08-30', 'active'),
(12, 'Trương Thị Yến', 'yen.truong@abccompany.vn', '0910000012', 1, 2, '2022-03-14', 'active'),
(13, 'Huỳnh Quốc Bảo', 'bao.huynh@abccompany.vn', '0910000013', 4, 3, '2019-12-01', 'active'),
(14, 'Cao Thị Thanh', 'thanh.cao@abccompany.vn', '0910000014', 2, 2, '2023-05-09', 'active'),
(15, 'Nguyễn Nhật Nam', 'nam.nguyen@abccompany.vn', '0910000015', 3, 1, '2024-01-08', 'active'),
(16, 'Phạm Thu Trang', 'trang.pham@abccompany.vn', '0910000016', 5, 2, '2021-11-11', 'active'),
(17, 'Lê Văn Phúc', 'phuc.le@abccompany.vn', '0910000017', 4, 4, '2018-02-02', 'active'),
(18, 'Trần Quốc Thái', 'thai.tran@abccompany.vn', '0910000018', 2, 3, '2019-09-19', 'active'),
(19, 'Ngô Minh Đức', 'duc.ngo@abccompany.vn', '0910000019', 3, 2, '2022-06-25', 'active'),
(20, 'Vũ Thị Mai Anh', 'maianh.vu@abccompany.vn', '0910000020', 1, 2, '2023-10-10', 'active'),
(21, 'Đinh Công Sơn', 'son.dinh@abccompany.vn', '0910000021', 4, 2, '2020-07-07', 'active'),
(22, 'Lâm Hoàng Long', 'long.lam@abccompany.vn', '0910000022', 3, 3, '2019-04-16', 'active'),
(23, 'Trịnh Thị Hương', 'huong.trinh@abccompany.vn', '0910000023', 5, 2, '2021-12-20', 'active'),
(24, 'Bùi Anh Khoa', 'khoa.bui@abccompany.vn', '0910000024', 3, 2, '2024-03-03', 'active'),
(25, 'Nguyễn Thị Tuyết', 'tuyet.nguyen@abccompany.vn', '0910000025', 1, 2, '2022-08-08', 'active'),
(26, 'Phạm Văn Lộc', 'loc.pham@abccompany.vn', '0910000026', 4, 3, '2020-05-25', 'active'),
(27, 'Hoàng Gia Huy', 'huy.hoang@abccompany.vn', '0910000027', 3, 3, '2019-01-14', 'active'),
(28, 'Đỗ Thị Kim Oanh', 'oanh.do@abccompany.vn', '0910000028', 2, 2, '2023-09-09', 'active'),
(29, 'Vương Quốc Dũng', 'dung.vuong@abccompany.vn', '0910000029', 4, 4, '2018-06-06', 'active'),
(30, 'Mai Thanh Bình', 'binh.mai@abccompany.vn', '0910000030', 5, 2, '2021-02-17', 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payrolls`
--

CREATE TABLE `payrolls` (
  `payroll_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `month` date NOT NULL,
  `base_salary` decimal(15,2) NOT NULL,
  `total_allowance` decimal(15,2) NOT NULL,
  `total_deduction` decimal(15,2) NOT NULL,
  `net_salary` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payrolls`
--

INSERT INTO `payrolls` (`payroll_id`, `employee_id`, `month`, `base_salary`, `total_allowance`, `total_deduction`, `net_salary`) VALUES
(1, 1, '2023-03-01', 15000000.00, 0.00, 0.00, 15000000.00),
(2, 1, '2024-03-01', 15000000.00, 0.00, 0.00, 15000000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payroll_history`
--

CREATE TABLE `payroll_history` (
  `history_id` int(11) NOT NULL,
  `payroll_id` int(11) NOT NULL,
  `old_net_salary` decimal(15,2) DEFAULT NULL,
  `new_net_salary` decimal(15,2) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `note` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `positions`
--

CREATE TABLE `positions` (
  `position_id` int(11) NOT NULL,
  `position_name` varchar(100) NOT NULL,
  `base_salary` decimal(15,2) NOT NULL CHECK (`base_salary` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `positions`
--

INSERT INTO `positions` (`position_id`, `position_name`, `base_salary`) VALUES
(1, 'Thực tập sinh', 4000000.00),
(2, 'Nhân viên', 8000000.00),
(3, 'Senior', 15000000.00),
(4, 'Trưởng nhóm', 20000000.00),
(5, 'Trưởng phòng', 30000000.00),
(6, 'Giám đốc', 50000000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Admin'),
(4, 'Employee'),
(2, 'HR'),
(3, 'Manager');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_id`, `employee_id`, `email`, `password_hash`, `role_id`, `is_active`, `created_at`) VALUES
(1, 4, 'anh.le@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(2, 13, 'bao.huynh@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(3, 30, 'binh.mai@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(4, 19, 'duc.ngo@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(5, 29, 'dung.vuong@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(6, 6, 'ha.dang@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(7, 10, 'hong.ly@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(8, 23, 'huong.trinh@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(9, 27, 'huy.hoang@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(10, 3, 'huy.pham@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(11, 9, 'khai.phan@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(12, 24, 'khoa.bui@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(13, 2, 'lan.tran@abccompany.vn', '123456', 2, 1, '2025-12-28 07:40:04'),
(14, 26, 'loc.pham@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(15, 22, 'long.lam@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(16, 7, 'long.nguyen@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(17, 8, 'mai.bui@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(18, 20, 'maianh.vu@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(19, 15, 'nam.nguyen@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(20, 28, 'oanh.do@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(21, 17, 'phuc.le@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(22, 11, 'quan.do@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(23, 21, 'son.dinh@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(24, 18, 'thai.tran@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(25, 14, 'thanh.cao@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(26, 16, 'trang.pham@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(27, 1, 'tuan.nguyen@abccompany.vn', '123456', 1, 1, '2025-12-28 07:40:04'),
(28, 5, 'tung.vo@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(29, 25, 'tuyet.nguyen@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04'),
(30, 12, 'yen.truong@abccompany.vn', '123456', 4, 1, '2025-12-28 07:40:04');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `allowances`
--
ALTER TABLE `allowances`
  ADD PRIMARY KEY (`allowance_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`,`month`);

--
-- Chỉ mục cho bảng `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`,`month`);

--
-- Chỉ mục cho bảng `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`contract_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Chỉ mục cho bảng `deductions`
--
ALTER TABLE `deductions`
  ADD PRIMARY KEY (`deduction_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`,`month`);

--
-- Chỉ mục cho bảng `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `department_name` (`department_name`);

--
-- Chỉ mục cho bảng `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `position_id` (`position_id`),
  ADD KEY `idx_emp_dept` (`department_id`);

--
-- Chỉ mục cho bảng `payrolls`
--
ALTER TABLE `payrolls`
  ADD PRIMARY KEY (`payroll_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`,`month`);

--
-- Chỉ mục cho bảng `payroll_history`
--
ALTER TABLE `payroll_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `payroll_id` (`payroll_id`),
  ADD KEY `changed_by` (`changed_by`);

--
-- Chỉ mục cho bảng `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`position_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `allowances`
--
ALTER TABLE `allowances`
  MODIFY `allowance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `contracts`
--
ALTER TABLE `contracts`
  MODIFY `contract_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `deductions`
--
ALTER TABLE `deductions`
  MODIFY `deduction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT cho bảng `payrolls`
--
ALTER TABLE `payrolls`
  MODIFY `payroll_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `payroll_history`
--
ALTER TABLE `payroll_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `positions`
--
ALTER TABLE `positions`
  MODIFY `position_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `allowances`
--
ALTER TABLE `allowances`
  ADD CONSTRAINT `allowances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Các ràng buộc cho bảng `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Các ràng buộc cho bảng `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Các ràng buộc cho bảng `deductions`
--
ALTER TABLE `deductions`
  ADD CONSTRAINT `deductions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Các ràng buộc cho bảng `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`),
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`);

--
-- Các ràng buộc cho bảng `payrolls`
--
ALTER TABLE `payrolls`
  ADD CONSTRAINT `payrolls_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Các ràng buộc cho bảng `payroll_history`
--
ALTER TABLE `payroll_history`
  ADD CONSTRAINT `payroll_history_ibfk_1` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`payroll_id`),
  ADD CONSTRAINT `payroll_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`);

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
