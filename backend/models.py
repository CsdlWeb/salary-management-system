from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Date
from sqlalchemy.orm import relationship
from database import Base

class Department(Base):
    __tablename__ = "departments"
    department_id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String(100), nullable=False)
    employees = relationship("Employee", back_populates="department")

class Position(Base):
    __tablename__ = "positions"
    position_id = Column(Integer, primary_key=True, index=True)
    position_name = Column(String(100), nullable=False)
    base_salary = Column(DECIMAL(15, 2), nullable=False)
    employees = relationship("Employee", back_populates="position")

class Employee(Base):
    __tablename__ = "employees"
    employee_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id"))
    position_id = Column(Integer, ForeignKey("positions.position_id"))
    hire_date = Column(Date, nullable=False)
    status = Column(String(20), default="active")

    department = relationship("Department", back_populates="employees")
    position = relationship("Position", back_populates="employees")

# --- THÊM CÁC BẢNG NÀY VÀO ĐỂ TÍNH ĐƯỢC LƯƠNG ---

class Allowance(Base):
    __tablename__ = "allowances"
    allowance_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"))
    month = Column(Date, nullable=False)
    allowance = Column(DECIMAL(15, 2), default=0)
    bonus = Column(DECIMAL(15, 2), default=0)

class Deduction(Base):
    __tablename__ = "deductions"
    deduction_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"))
    month = Column(Date, nullable=False)
    insurance = Column(DECIMAL(15, 2), default=0)
    tax = Column(DECIMAL(15, 2), default=0)
    other = Column(DECIMAL(15, 2), default=0)

class Payroll(Base):
    __tablename__ = "payrolls"
    payroll_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"))
    month = Column(Date, nullable=False)
    base_salary = Column(DECIMAL(15, 2))
    total_allowance = Column(DECIMAL(15, 2))
    total_deduction = Column(DECIMAL(15, 2))
    net_salary = Column(DECIMAL(15, 2))