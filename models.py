from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Date, Boolean, Enum
from database import Base

class Employee(Base):
    __tablename__ = "employees"
    employee_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150))
    email = Column(String(150), unique=True)
    position_id = Column(Integer, ForeignKey("positions.position_id"))

class Position(Base):
    __tablename__ = "positions"
    position_id = Column(Integer, primary_key=True)
    position_name = Column(String(100))
    base_salary = Column(DECIMAL(15, 2))

class Allowance(Base):
    __tablename__ = "allowances"
    allowance_id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"))
    month = Column(Date)
    allowance = Column(DECIMAL(15, 2), default=0)
    bonus = Column(DECIMAL(15, 2), default=0)

class Deduction(Base):
    __tablename__ = "deductions"
    deduction_id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"))
    month = Column(Date)
    insurance = Column(DECIMAL(15, 2), default=0)
    tax = Column(DECIMAL(15, 2), default=0)
    other = Column(DECIMAL(15, 2), default=0)

class Payroll(Base):
    __tablename__ = "payrolls"
    payroll_id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"))
    month = Column(Date)
    base_salary = Column(DECIMAL(15, 2))
    total_allowance = Column(DECIMAL(15, 2))
    total_deduction = Column(DECIMAL(15, 2))
    net_salary = Column(DECIMAL(15, 2))