
from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

# --- SCHEMAS CHO TÍNH LƯƠNG ---
class PayrollCalculateRequest(BaseModel):
    employee_id: int
    month: date

# --- SCHEMAS CHO NHÂN VIÊN (CRUD) ---
class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    department_id: int
    position_id: int
    hire_date: date
    status: Optional[str] = "active"

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    status: Optional[str] = None

class EmployeeOut(BaseModel):
    employee_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    department_id: Optional[int] = None
    position_id: Optional[int] = None
    hire_date: Optional[date] = None
    status: Optional[str] = "active"

    class Config:
        from_attributes = True