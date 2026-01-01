from pydantic import BaseModel
from datetime import date

class PayrollCalculateRequest(BaseModel):
    employee_id: int
    month: date # Định dạng YYYY-MM-DD

class EmployeeOut(BaseModel):
    employee_id: int
    full_name: str
    email: str
    class Config:
        from_attributes = True