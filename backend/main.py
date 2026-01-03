from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text 
from database import engine, get_db
from functools import wraps
from pydantic import BaseModel
import models
import schemas
import auth 
import uvicorn

# 1. Khởi tạo Database - Đảm bảo các Model đã được định nghĩa trước khi tạo Table
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hệ thống Quản lý Nhân viên",
    version="1.0.0"
)


# 2. Cấu hình CORS - Cho phép Frontend kết nối tới API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HỆ THỐNG & KIỂM TRA ---

@app.get("/")
async def root():
    return {"message": "API Quản lý Nhân viên đang hoạt động", "docs": "/docs"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# --- QUẢN LÝ NHÂN VIÊN (CRUD) ---

@app.get("/employees", response_model=list[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

@app.get("/employees/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    return emp

@app.post("/employees", response_model=schemas.EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(emp: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.email == emp.email).first()
    if db_employee:
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    
    new_emp = models.Employee(**emp.dict())
    try:
        db.add(new_emp)
        db.commit()
        db.refresh(new_emp)
        return new_emp
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi database: {str(e)}")

@app.put("/employees/{employee_id}", response_model=schemas.EmployeeOut)
def update_employee(employee_id: int, emp_update: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    db_emp = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    
    update_data = emp_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_emp, key, value)
    
    try:
        db.commit()
        db.refresh(db_emp)
        return db_emp
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_emp = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    try:
        db.delete(db_emp)
        db.commit()
        return {"status": "success", "message": f"Đã xóa nhân viên ID {employee_id}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- TÍNH LƯƠNG ---

@app.post("/calculate-payroll")
def calculate_payroll(req: schemas.PayrollCalculateRequest, db: Session = Depends(get_db)):
    # 1. Kiểm tra nhân viên và chức vụ
    emp = db.query(models.Employee).filter(models.Employee.employee_id == req.employee_id).first()
    if not emp: 
        raise HTTPException(status_code=404, detail="Nhân viên không tồn tại")
    
    pos = db.query(models.Position).filter(models.Position.position_id == emp.position_id).first()
    if not pos:
        raise HTTPException(status_code=400, detail="Chưa cấu hình lương cho chức vụ của nhân viên này")
    
    base_salary = float(pos.base_salary or 0)

    # 2. Lấy phụ cấp & thưởng (Nếu không có trả về 0)
    aln = db.query(models.Allowance).filter(
        models.Allowance.employee_id == req.employee_id, 
        models.Allowance.month == req.month
    ).first()
    total_allowance = (float(aln.allowance or 0) + float(aln.bonus or 0)) if aln else 0.0

    # 3. Lấy các khoản giảm trừ (Nếu không có trả về 0)
    ded = db.query(models.Deduction).filter(
        models.Deduction.employee_id == req.employee_id, 
        models.Deduction.month == req.month
    ).first()
    total_deduction = (float(ded.insurance or 0) + float(ded.tax or 0) + float(ded.other or 0)) if ded else 0.0

    # 4. Tính toán
    net_salary = (base_salary + total_allowance) - total_deduction

    try:
        new_payroll = models.Payroll(
            employee_id=req.employee_id,
            month=req.month,
            base_salary=base_salary,
            total_allowance=total_allowance,
            total_deduction=total_deduction,
            net_salary=net_salary
        )
        db.merge(new_payroll)
        db.commit()

        # Cập nhật return để gửi đầy đủ dữ liệu thành phần về cho HTML
        return {
            "status": "success",
            "message": "Tính lương thành công",
            "base_salary": float(base_salary),      # Gửi lương cơ bản
            "total_allowance": float(total_allowance), # Gửi tổng phụ cấp
            "total_deduction": float(total_deduction), # Gửi tổng giảm trừ
            "net_salary": float(net_salary)            # Lương thực nhận
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi lưu bảng lương: {str(e)}")
    
@app.get("/payroll-report")
def get_payroll_report(role_id: int = None, employee_id: int = None, db: Session = Depends(get_db)):
    try:
        # Nếu không truyền role_id hoặc là Admin/HR (1, 2, 3), cho xem hết
        if role_id is None or int(role_id) in [1, 2, 3]:
            sql = text("""
                SELECT p.*, e.full_name 
                FROM payrolls p 
                JOIN employees e ON p.employee_id = e.employee_id
            """)
            results = db.execute(sql).fetchall()
        else:
            # Nếu là Employee (4), chỉ cho xem của chính mình
            sql = text("""
                SELECT p.*, e.full_name 
                FROM payrolls p 
                JOIN employees e ON p.employee_id = e.employee_id 
                WHERE p.employee_id = :emp_id
            """)
            results = db.execute(sql, {"emp_id": employee_id}).fetchall()
        
        report = []
        for r in results:
            row = r._mapping
            report.append({
                "employee_id": row["employee_id"],
                "full_name": row["full_name"],
                "month": str(row["month"]),
                "base_salary": float(row["base_salary"] or 0),
                "total_allowance": float(row["total_allowance"] or 0),
                "total_deduction": float(row["total_deduction"] or 0),
                "net_salary": float(row["net_salary"] or 0)
            })
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
    

# API lấy chi tiết phiếu lương cho 1 nhân viên
@app.get("/payslip/{employee_id}/{month}")
def get_payslip(employee_id: int, month: str, db: Session = Depends(get_db)):
    query = text("""
        SELECT p.*, e.full_name, d.department_name, pos.position_name
        FROM payrolls p
        JOIN employees e ON p.employee_id = e.employee_id
        JOIN departments d ON e.department_id = d.department_id
        JOIN positions pos ON e.position_id = pos.position_id
        WHERE p.employee_id = :emp_id AND p.month = :month
    """)
    result = db.execute(query, {"emp_id": employee_id, "month": month}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiếu lương")
    
    return result._mapping

# Hàm kiểm tra quyền hạn
def role_required(allowed_roles: list):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Giả sử bạn đã giải mã token và có user_role từ Header Authorization
            # Ở bước này, để đơn giản, chúng ta sẽ lấy role_id từ thông tin đăng nhập
            user_role = kwargs.get("current_user_role") # Logic lấy role từ JWT
            if user_role not in allowed_roles:
                raise HTTPException(status_code=403, detail="Bạn không có quyền thực hiện hành động này")
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# API Đăng nhập trả về đầy đủ thông tin phân quyền
@app.post("/login")
def login(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    password = payload.get("password")

    query = text("SELECT employee_id, email, password_hash, role_id FROM users WHERE email = :email AND is_active = 1")
    result = db.execute(query, {"email": email}).fetchone()

    if not result or not auth.verify_password(password, str(result._mapping["password_hash"])):
        raise HTTPException(status_code=401, detail="Thông tin đăng nhập không chính xác")

    user = result._mapping
    access_token = auth.create_access_token(data={"sub": user["email"], "role_id": user["role_id"]})
    
    # Trả về thêm role_id và employee_id để Frontend lưu trữ
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role_id": user["role_id"],
        "employee_id": user["employee_id"]
    }

class ChangePasswordRequest(BaseModel):
    user_id: int
    old_password: str
    new_password: str

# API Đổi mật khẩu
# Đảm bảo đã khai báo class này ở trên
class ChangePasswordRequest(BaseModel):
    user_id: int
    old_password: str
    new_password: str

@app.post("/change-password")
def change_password(req: ChangePasswordRequest, db: Session = Depends(get_db)):
    # Tìm user trong DB
    query = text("SELECT employee_id, password_hash FROM users WHERE employee_id = :uid")
    user = db.execute(query, {"uid": req.user_id}).fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    # Kiểm tra mật khẩu cũ bằng hàm verify trong auth.py
    if not auth.verify_password(req.old_password, user._mapping["password_hash"]):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không chính xác")

    # Cập nhật mật khẩu mới
    new_pass = auth.get_password_hash(req.new_password)
    update_sql = text("UPDATE users SET password_hash = :new_p WHERE employee_id = :uid")
    
    try:
        db.execute(update_sql, {"new_p": new_pass, "uid": req.user_id})
        db.commit()
        return {"status": "success", "message": "Đổi mật khẩu thành công"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi lưu database")
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)