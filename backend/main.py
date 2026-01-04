from fastapi import FastAPI, Depends, HTTPException, status, Header
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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  
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

@app.get("/admin/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        total_employees = db.query(models.Employee).count()
        
        dept_query = text("SELECT COUNT(*) FROM departments")
        total_departments = db.execute(dept_query).scalar() or 0
        
        payroll_query = text("SELECT COALESCE(SUM(net_salary), 0) FROM payrolls")
        total_payroll = float(db.execute(payroll_query).scalar() or 0)
        
        avg_salary_query = text("SELECT COALESCE(AVG(net_salary), 0) FROM payrolls")
        average_salary = float(db.execute(avg_salary_query).scalar() or 0)
        
        current_month_employees_query = text("""
            SELECT COUNT(DISTINCT employee_id) 
            FROM payrolls 
            WHERE DATE_FORMAT(month, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
        """)
        current_month_employees = db.execute(current_month_employees_query).scalar() or 0
        
        last_month_employees_query = text("""
            SELECT COUNT(DISTINCT employee_id) 
            FROM payrolls 
            WHERE DATE_FORMAT(month, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
        """)
        last_month_employees = db.execute(last_month_employees_query).scalar() or 0
        
        if last_month_employees > 0:
            employees_change = ((current_month_employees - last_month_employees) / last_month_employees) * 100
        else:
            employees_change = 0.0
        
        current_month_payroll_query = text("""
            SELECT COALESCE(SUM(net_salary), 0) 
            FROM payrolls 
            WHERE DATE_FORMAT(month, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
        """)
        current_month_payroll = float(db.execute(current_month_payroll_query).scalar() or 0)
        
        last_month_payroll_query = text("""
            SELECT COALESCE(SUM(net_salary), 0) 
            FROM payrolls 
            WHERE DATE_FORMAT(month, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
        """)
        last_month_payroll = float(db.execute(last_month_payroll_query).scalar() or 0)
        
        if last_month_payroll > 0:
            payroll_change = ((current_month_payroll - last_month_payroll) / last_month_payroll) * 100
        else:
            payroll_change = 0.0
        
        return {
            "success": True,
            "data": {
                "totalEmployees": total_employees,
                "totalDepartments": total_departments,
                "totalPayroll": total_payroll,
                "averageSalary": average_salary,
                "monthlyChange": {
                    "employees": round(employees_change, 2),
                    "payroll": round(payroll_change, 2)
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/dashboard/salary-by-department")
def get_salary_by_department(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT d.department_name as name, 
                   COALESCE(AVG(p.base_salary), 0) as value
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            LEFT JOIN positions pos ON e.position_id = pos.position_id
            LEFT JOIN payrolls p ON e.employee_id = p.employee_id
            GROUP BY d.department_id, d.department_name
        """)
        result = db.execute(query).fetchall()
        data = [{"name": row[0], "value": float(row[1])} for row in result]
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": True, "data": []}

@app.get("/admin/dashboard/employees-by-department")
def get_employees_by_department(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT d.department_name as name, 
                   COUNT(e.employee_id) as value
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            GROUP BY d.department_id, d.department_name
        """)
        result = db.execute(query).fetchall()
        data = [{"name": row[0], "value": int(row[1])} for row in result]
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": True, "data": []}

@app.get("/admin/dashboard/monthly-payroll")
def get_monthly_payroll(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT DATE_FORMAT(month, '%Y-%m') as name,
                   SUM(net_salary) as value
            FROM payrolls
            GROUP BY DATE_FORMAT(month, '%Y-%m')
            ORDER BY name DESC
            LIMIT 12
        """)
        result = db.execute(query).fetchall()
        data = [{"name": row[0], "value": float(row[1])} for row in result]
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": True, "data": []}

@app.get("/admin/departments")
def get_departments(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                department_id,
                department_name
            FROM departments
            ORDER BY department_id
        """)
        result = db.execute(query).fetchall()
        
        departments = []
        for row in result:
            emp_count_query = text("SELECT COUNT(*) FROM employees WHERE department_id = :dept_id")
            emp_count = db.execute(emp_count_query, {"dept_id": row[0]}).scalar() or 0
            
            departments.append({
                "id": str(row[0]),
                "code": f"DEPT{row[0]:03d}",
                "name": row[1],
                "manager": "",
                "employeeCount": emp_count,
                "description": "",
                "createdDate": ""
            })
        
        return {"success": True, "data": departments}
    except Exception as e:
        return {"success": False, "data": [], "message": str(e)}

@app.get("/admin/positions")
def get_positions(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                position_id,
                position_name,
                base_salary
            FROM positions
            ORDER BY position_id
        """)
        result = db.execute(query).fetchall()
        
        positions = []
        for row in result:
            positions.append({
                "id": str(row[0]),
                "name": row[1],
                "baseSalary": float(row[2]) if row[2] else 0
            })
        
        return {"success": True, "data": positions}
    except Exception as e:
        return {"success": False, "data": [], "message": str(e)}

@app.get("/admin/departments/{id}")
def get_department(id: int, db: Session = Depends(get_db)):
    try:
        query = text("SELECT department_id, department_name FROM departments WHERE department_id = :dept_id")
        result = db.execute(query, {"dept_id": id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Không tìm thấy phòng ban")
        
        emp_count_query = text("SELECT COUNT(*) FROM employees WHERE department_id = :dept_id")
        emp_count = db.execute(emp_count_query, {"dept_id": id}).scalar() or 0
        
        return {
            "success": True,
            "data": {
                "id": str(result[0]),
                "code": f"DEPT{result[0]:03d}",
                "name": result[1],
                "manager": "",
                "employeeCount": emp_count,
                "description": "",
                "createdDate": ""
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/departments")
def create_department(payload: dict, db: Session = Depends(get_db)):
    try:
        name = payload.get("name")
        if not name:
            raise HTTPException(status_code=400, detail="Tên phòng ban không được để trống")
        
        query = text("INSERT INTO departments (department_name) VALUES (:name)")
        db.execute(query, {"name": name})
        db.commit()
        
        new_dept_query = text("SELECT department_id, department_name FROM departments WHERE department_name = :name ORDER BY department_id DESC LIMIT 1")
        new_dept = db.execute(new_dept_query, {"name": name}).fetchone()
        
        return {
            "success": True,
            "data": {
                "id": str(new_dept[0]),
                "code": f"DEPT{new_dept[0]:03d}",
                "name": new_dept[1],
                "manager": "",
                "employeeCount": 0,
                "description": "",
                "createdDate": ""
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/admin/departments/{id}")
def update_department(id: int, payload: dict, db: Session = Depends(get_db)):
    try:
        query = text("SELECT department_id FROM departments WHERE department_id = :dept_id")
        result = db.execute(query, {"dept_id": id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Không tìm thấy phòng ban")
        
        name = payload.get("name")
        if name:
            update_query = text("UPDATE departments SET department_name = :name WHERE department_id = :dept_id")
            db.execute(update_query, {"name": name, "dept_id": id})
            db.commit()
        
        get_query = text("SELECT department_id, department_name FROM departments WHERE department_id = :dept_id")
        updated = db.execute(get_query, {"dept_id": id}).fetchone()
        
        emp_count_query = text("SELECT COUNT(*) FROM employees WHERE department_id = :dept_id")
        emp_count = db.execute(emp_count_query, {"dept_id": id}).scalar() or 0
        
        return {
            "success": True,
            "data": {
                "id": str(updated[0]),
                "code": f"DEPT{updated[0]:03d}",
                "name": updated[1],
                "manager": "",
                "employeeCount": emp_count,
                "description": "",
                "createdDate": ""
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/admin/departments/{id}")
def delete_department(id: int, db: Session = Depends(get_db)):
    try:
        query = text("SELECT department_id FROM departments WHERE department_id = :dept_id")
        result = db.execute(query, {"dept_id": id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Không tìm thấy phòng ban")
        
        emp_check = text("SELECT COUNT(*) FROM employees WHERE department_id = :dept_id")
        emp_count = db.execute(emp_check, {"dept_id": id}).scalar() or 0
        
        if emp_count > 0:
            raise HTTPException(status_code=400, detail="Không thể xóa phòng ban đang có nhân viên")
        
        delete_query = text("DELETE FROM departments WHERE department_id = :dept_id")
        db.execute(delete_query, {"dept_id": id})
        db.commit()
        
        return {"success": True, "data": None}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/employees")
def get_admin_employees(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                e.employee_id,
                e.full_name,
                e.email,
                e.phone,
                d.department_name,
                pos.position_name,
                e.hire_date,
                e.status,
                pos.base_salary
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN positions pos ON e.position_id = pos.position_id
            ORDER BY e.employee_id
        """)
        result = db.execute(query).fetchall()
        
        employees = []
        for row in result:
            employees.append({
                "id": str(row[0]),
                "employeeCode": f"EMP{row[0]:04d}",
                "name": row[1],
                "email": row[2],
                "phone": row[3] or "",
                "department": row[4] or "",
                "position": row[5] or "",
                "hireDate": str(row[6]) if row[6] else "",
                "status": row[7] or "active",
                "departmentId": str(row[0]) if row[0] else "",
                "salary": float(row[8]) if row[8] else 0
            })
        
        return {"success": True, "data": employees}
    except Exception as e:
        return {"success": False, "data": [], "message": str(e)}

@app.get("/admin/employees/{id}")
def get_admin_employee(id: int, db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                e.employee_id,
                e.full_name,
                e.email,
                e.phone,
                d.department_name,
                pos.position_name,
                e.hire_date,
                e.status,
                pos.base_salary,
                e.department_id,
                e.position_id
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN positions pos ON e.position_id = pos.position_id
            WHERE e.employee_id = :emp_id
        """)
        result = db.execute(query, {"emp_id": id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
        
        # Format hire date
        hire_date = ""
        if result[6]:
            hd = str(result[6])
            if len(hd) >= 10:
                hire_date = hd[:10]
        
        return {
            "success": True,
            "data": {
                "id": str(result[0]),
                "employeeCode": f"EMP{result[0]:04d}",
                "name": result[1],
                "email": result[2],
                "phone": result[3] or "",
                "dateOfBirth": "",  # Không có trong database
                "address": "",  # Không có trong database
                "department": result[4] or "",
                "position": result[5] or "",
                "hireDate": hire_date,
                "startDate": hire_date,
                "status": result[7] or "active",
                "departmentId": str(result[9]) if result[9] else "",
                "positionId": str(result[10]) if result[10] else "",
                "salary": float(result[8]) if result[8] else 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/employees")
def create_admin_employee(payload: dict, db: Session = Depends(get_db)):
    try:
        name = payload.get("name")
        email = payload.get("email")
        phone = payload.get("phone", "")
        department_id = int(payload.get("departmentId", 0)) if payload.get("departmentId") else None
        position_id = int(payload.get("positionId", 0)) if payload.get("positionId") else None
        hire_date = payload.get("hireDate")
        status = payload.get("status", "active")
        
        if not name or not email:
            raise HTTPException(status_code=400, detail="Tên và email không được để trống")
        
        check_email = text("SELECT employee_id FROM employees WHERE email = :email")
        existing = db.execute(check_email, {"email": email}).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email đã được sử dụng")
        
        insert_query = text("""
            INSERT INTO employees (full_name, email, phone, department_id, position_id, hire_date, status)
            VALUES (:name, :email, :phone, :dept_id, :pos_id, :hire_date, :status)
        """)
        db.execute(insert_query, {
            "name": name,
            "email": email,
            "phone": phone,
            "dept_id": department_id,
            "pos_id": position_id,
            "hire_date": hire_date,
            "status": status
        })
        db.commit()
        
        new_emp_query = text("""
            SELECT e.employee_id, e.full_name, e.email, e.phone, d.department_name, 
                   pos.position_name, e.hire_date, e.status, pos.base_salary, e.department_id
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN positions pos ON e.position_id = pos.position_id
            WHERE e.email = :email
            ORDER BY e.employee_id DESC LIMIT 1
        """)
        new_emp = db.execute(new_emp_query, {"email": email}).fetchone()
        
        return {
            "success": True,
            "data": {
                "id": str(new_emp[0]),
                "employeeCode": f"EMP{new_emp[0]:04d}",
                "name": new_emp[1],
                "email": new_emp[2],
                "phone": new_emp[3] or "",
                "department": new_emp[4] or "",
                "position": new_emp[5] or "",
                "hireDate": str(new_emp[6]) if new_emp[6] else "",
                "status": new_emp[7] or "active",
                "departmentId": str(new_emp[9]) if new_emp[9] else "",
                "salary": float(new_emp[8]) if new_emp[8] else 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/admin/employees/{id}")
def update_admin_employee(id: int, payload: dict, db: Session = Depends(get_db)):
    try:
        check_query = text("SELECT employee_id FROM employees WHERE employee_id = :emp_id")
        existing = db.execute(check_query, {"emp_id": id}).fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
        
        update_fields = []
        params = {"emp_id": id}
        
        if "name" in payload:
            update_fields.append("full_name = :name")
            params["name"] = payload["name"]
        
        if "email" in payload:
            check_email = text("SELECT employee_id FROM employees WHERE email = :email AND employee_id != :emp_id")
            email_exists = db.execute(check_email, {"email": payload["email"], "emp_id": id}).fetchone()
            if email_exists:
                raise HTTPException(status_code=400, detail="Email đã được sử dụng")
            update_fields.append("email = :email")
            params["email"] = payload["email"]
        
        if "phone" in payload:
            update_fields.append("phone = :phone")
            params["phone"] = payload["phone"]
        
        if "departmentId" in payload:
            update_fields.append("department_id = :dept_id")
            params["dept_id"] = int(payload["departmentId"]) if payload["departmentId"] else None
        
        if "positionId" in payload:
            update_fields.append("position_id = :pos_id")
            params["pos_id"] = int(payload["positionId"]) if payload["positionId"] else None
        
        if "status" in payload:
            update_fields.append("status = :status")
            params["status"] = payload["status"]
        
        if "hireDate" in payload:
            update_fields.append("hire_date = :hire_date")
            params["hire_date"] = payload["hireDate"] if payload["hireDate"] else None
        
        if update_fields:
            update_query = text(f"UPDATE employees SET {', '.join(update_fields)} WHERE employee_id = :emp_id")
            db.execute(update_query, params)
            db.commit()
        
        get_query = text("""
            SELECT e.employee_id, e.full_name, e.email, e.phone, d.department_name, 
                   pos.position_name, e.hire_date, e.status, pos.base_salary, e.department_id,
                   e.position_id
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN positions pos ON e.position_id = pos.position_id
            WHERE e.employee_id = :emp_id
        """)
        updated = db.execute(get_query, {"emp_id": id}).fetchone()
        
        hire_date = ""
        if updated[6]:
            hd = str(updated[6])
            if len(hd) >= 10:
                hire_date = hd[:10]
        
        return {
            "success": True,
            "data": {
                "id": str(updated[0]),
                "employeeCode": f"EMP{updated[0]:04d}",
                "name": updated[1],
                "email": updated[2],
                "phone": updated[3] or "",
                "department": updated[4] or "",
                "position": updated[5] or "",
                "hireDate": hire_date,
                "startDate": hire_date,
                "status": updated[7] or "active",
                "departmentId": str(updated[9]) if updated[9] else "",
                "positionId": str(updated[10]) if updated[10] else "",
                "salary": float(updated[8]) if updated[8] else 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/admin/employees/{id}")
def delete_admin_employee(id: int, db: Session = Depends(get_db)):
    try:
        check_query = text("SELECT employee_id FROM employees WHERE employee_id = :emp_id")
        existing = db.execute(check_query, {"emp_id": id}).fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
        
        delete_query = text("DELETE FROM employees WHERE employee_id = :emp_id")
        db.execute(delete_query, {"emp_id": id})
        db.commit()
        
        return {"success": True, "data": None}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/payroll")
def get_admin_payroll(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                p.payroll_id,
                p.employee_id,
                e.full_name,
                e.email,
                d.department_name,
                p.month,
                p.base_salary,
                p.total_allowance,
                p.total_deduction,
                p.net_salary
            FROM payrolls p
            JOIN employees e ON p.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            ORDER BY p.month DESC, p.payroll_id DESC
        """)
        result = db.execute(query).fetchall()
        
        payroll_entries = []
        for row in result:
            month_date = row[5]
            payroll_entries.append({
                "id": str(row[0]),
                "employeeId": str(row[1]),
                "employeeName": row[2],
                "employeeCode": f"EMP{row[1]:04d}",
                "department": row[4] or "",
                "month": str(month_date)[:7] if month_date else "",
                "year": int(str(month_date)[:4]) if month_date else 0,
                "baseSalary": float(row[6]) if row[6] else 0,
                "allowances": float(row[7]) if row[7] else 0,
                "bonus": 0,
                "deductions": float(row[8]) if row[8] else 0,
                "netSalary": float(row[9]) if row[9] else 0,
                "status": "paid",
                "createdDate": str(month_date) if month_date else "",
                "paidDate": str(month_date) if month_date else ""
            })
        
        return {"success": True, "data": payroll_entries}
    except Exception as e:
        return {"success": False, "data": [], "message": str(e)}

@app.get("/admin/payroll/{id}")
def get_admin_payroll_entry(id: int, db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                p.payroll_id,
                p.employee_id,
                e.full_name,
                e.email,
                d.department_name,
                p.month,
                p.base_salary,
                p.total_allowance,
                p.total_deduction,
                p.net_salary
            FROM payrolls p
            JOIN employees e ON p.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE p.payroll_id = :payroll_id
        """)
        result = db.execute(query, {"payroll_id": id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Không tìm thấy bảng lương")
        
        month_date = result[5]
        return {
            "success": True,
            "data": {
                "id": str(result[0]),
                "employeeId": str(result[1]),
                "employeeName": result[2],
                "employeeCode": f"EMP{result[1]:04d}",
                "department": result[4] or "",
                "month": str(month_date)[:7] if month_date else "",
                "year": int(str(month_date)[:4]) if month_date else 0,
                "baseSalary": float(result[6]) if result[6] else 0,
                "allowances": float(result[7]) if result[7] else 0,
                "bonus": 0,
                "deductions": float(result[8]) if result[8] else 0,
                "netSalary": float(result[9]) if result[9] else 0,
                "status": "paid",
                "createdDate": str(month_date) if month_date else "",
                "paidDate": str(month_date) if month_date else ""
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/payroll")
def create_admin_payroll(payload: dict, db: Session = Depends(get_db)):
    try:
        employee_id = int(payload.get("employeeId", 0))
        month = payload.get("month")
        base_salary = float(payload.get("baseSalary", 0))
        allowances = float(payload.get("allowances", 0))
        deductions = float(payload.get("deductions", 0))
        
        if not employee_id or not month:
            raise HTTPException(status_code=400, detail="Thiếu thông tin bắt buộc")
        
        check_emp = text("SELECT employee_id FROM employees WHERE employee_id = :emp_id")
        emp_exists = db.execute(check_emp, {"emp_id": employee_id}).fetchone()
        if not emp_exists:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
        
        net_salary = base_salary + allowances - deductions
        
        insert_query = text("""
            INSERT INTO payrolls (employee_id, month, base_salary, total_allowance, total_deduction, net_salary)
            VALUES (:emp_id, :month, :base, :allowance, :deduction, :net)
        """)
        db.execute(insert_query, {
            "emp_id": employee_id,
            "month": month,
            "base": base_salary,
            "allowance": allowances,
            "deduction": deductions,
            "net": net_salary
        })
        db.commit()
        
        new_payroll_query = text("""
            SELECT 
                p.payroll_id,
                p.employee_id,
                e.full_name,
                d.department_name,
                p.month,
                p.base_salary,
                p.total_allowance,
                p.total_deduction,
                p.net_salary
            FROM payrolls p
            JOIN employees e ON p.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE p.employee_id = :emp_id AND p.month = :month
            ORDER BY p.payroll_id DESC LIMIT 1
        """)
        new_payroll = db.execute(new_payroll_query, {"emp_id": employee_id, "month": month}).fetchone()
        
        month_date = new_payroll[4]
        return {
            "success": True,
            "data": {
                "id": str(new_payroll[0]),
                "employeeId": str(new_payroll[1]),
                "employeeName": new_payroll[2],
                "employeeCode": f"EMP{new_payroll[1]:04d}",
                "department": new_payroll[3] or "",
                "month": str(month_date)[:7] if month_date else "",
                "year": int(str(month_date)[:4]) if month_date else 0,
                "baseSalary": float(new_payroll[5]) if new_payroll[5] else 0,
                "allowances": float(new_payroll[6]) if new_payroll[6] else 0,
                "bonus": 0,
                "deductions": float(new_payroll[7]) if new_payroll[7] else 0,
                "netSalary": float(new_payroll[8]) if new_payroll[8] else 0,
                "status": "paid",
                "createdDate": str(month_date) if month_date else "",
                "paidDate": str(month_date) if month_date else ""
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/admin/payroll/{id}")
def update_admin_payroll(id: int, payload: dict, db: Session = Depends(get_db)):
    try:
        check_query = text("SELECT payroll_id FROM payrolls WHERE payroll_id = :payroll_id")
        existing = db.execute(check_query, {"payroll_id": id}).fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Không tìm thấy bảng lương")
        
        update_fields = []
        params = {"payroll_id": id}
        
        if "baseSalary" in payload:
            update_fields.append("base_salary = :base")
            params["base"] = float(payload["baseSalary"])
        
        if "allowances" in payload:
            update_fields.append("total_allowance = :allowance")
            params["allowance"] = float(payload["allowances"])
        
        if "deductions" in payload:
            update_fields.append("total_deduction = :deduction")
            params["deduction"] = float(payload["deductions"])
        
        if update_fields:
            get_current_query = text("SELECT base_salary, total_allowance, total_deduction FROM payrolls WHERE payroll_id = :payroll_id")
            current = db.execute(get_current_query, {"payroll_id": id}).fetchone()
            
            base = params.get("base", float(current[0]) if current[0] else 0)
            allowance = params.get("allowance", float(current[1]) if current[1] else 0)
            deduction = params.get("deduction", float(current[2]) if current[2] else 0)
            net = base + allowance - deduction
            
            update_fields.append("net_salary = :net")
            params["net"] = net
            
            update_query = text(f"UPDATE payrolls SET {', '.join(update_fields)} WHERE payroll_id = :payroll_id")
            db.execute(update_query, params)
            db.commit()
        
        get_query = text("""
            SELECT 
                p.payroll_id,
                p.employee_id,
                e.full_name,
                d.department_name,
                p.month,
                p.base_salary,
                p.total_allowance,
                p.total_deduction,
                p.net_salary
            FROM payrolls p
            JOIN employees e ON p.employee_id = e.employee_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE p.payroll_id = :payroll_id
        """)
        updated = db.execute(get_query, {"payroll_id": id}).fetchone()
        
        month_date = updated[4]
        return {
            "success": True,
            "data": {
                "id": str(updated[0]),
                "employeeId": str(updated[1]),
                "employeeName": updated[2],
                "employeeCode": f"EMP{updated[1]:04d}",
                "department": updated[3] or "",
                "month": str(month_date)[:7] if month_date else "",
                "year": int(str(month_date)[:4]) if month_date else 0,
                "baseSalary": float(updated[5]) if updated[5] else 0,
                "allowances": float(updated[6]) if updated[6] else 0,
                "bonus": 0,
                "deductions": float(updated[7]) if updated[7] else 0,
                "netSalary": float(updated[8]) if updated[8] else 0,
                "status": "paid",
                "createdDate": str(month_date) if month_date else "",
                "paidDate": str(month_date) if month_date else ""
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/admin/payroll/{id}")
def delete_admin_payroll(id: int, db: Session = Depends(get_db)):
    try:
        check_query = text("SELECT payroll_id FROM payrolls WHERE payroll_id = :payroll_id")
        existing = db.execute(check_query, {"payroll_id": id}).fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="Không tìm thấy bảng lương")
        
        delete_query = text("DELETE FROM payrolls WHERE payroll_id = :payroll_id")
        db.execute(delete_query, {"payroll_id": id})
        db.commit()
        
        return {"success": True, "data": None}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Thiếu token xác thực")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = auth.verify_token(token)
        email = payload.get("sub")
        
        if not email:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        
        query = text("SELECT employee_id, email, role_id FROM users WHERE email = :email AND is_active = 1")
        result = db.execute(query, {"email": email}).fetchone()
        
        if not result:
            raise HTTPException(status_code=401, detail="Người dùng không tồn tại")
        
        return {
            "employee_id": result[0],
            "email": result[1],
            "role_id": result[2]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

@app.get("/employee/profile")
def get_employee_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        employee_id = current_user.get("employee_id")
        
        if not employee_id:
            raise HTTPException(status_code=400, detail="Không tìm thấy employee_id trong thông tin người dùng")
        
        query = text("""
            SELECT e.employee_id, e.full_name, e.email, e.phone, 
                   d.department_name, pos.position_name, e.hire_date, e.status,
                   pos.base_salary, e.department_id
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN positions pos ON e.position_id = pos.position_id
            WHERE e.employee_id = :emp_id
        """)
        result = db.execute(query, {"emp_id": employee_id}).fetchone()
        
        if not result:
            raise HTTPException(
                status_code=404, 
                detail=f"Không tìm thấy nhân viên với ID {employee_id}. Vui lòng kiểm tra employee_id trong bảng users có khớp với employees không."
            )
        
        return {
            "success": True,
            "data": {
                "id": str(result[0]),
                "employeeCode": f"EMP{result[0]:04d}",
                "name": result[1] or "",
                "email": result[2] or "",
                "phone": result[3] or "",
                "department": result[4] or "",
                "position": result[5] or "",
                "startDate": str(result[6]) if result[6] else "",
                "status": result[7] or "active",
                "salary": float(result[8]) if result[8] else 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")

@app.get("/employee/salary")
def get_employee_salary(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        employee_id = current_user["employee_id"]
        
        pos_query = text("""
            SELECT pos.base_salary 
            FROM employees e
            LEFT JOIN positions pos ON e.position_id = pos.position_id
            WHERE e.employee_id = :emp_id
        """)
        pos_result = db.execute(pos_query, {"emp_id": employee_id}).fetchone()
        base_salary = float(pos_result[0]) if pos_result and pos_result[0] else 0
        
        latest_payroll_query = text("""
            SELECT total_allowance, total_deduction, net_salary
            FROM payrolls
            WHERE employee_id = :emp_id
            ORDER BY month DESC
            LIMIT 1
        """)
        payroll_result = db.execute(latest_payroll_query, {"emp_id": employee_id}).fetchone()
        
        allowances = float(payroll_result[0]) if payroll_result and payroll_result[0] else 0
        deductions = float(payroll_result[1]) if payroll_result and payroll_result[1] else 0
        net_salary = float(payroll_result[2]) if payroll_result and payroll_result[2] else base_salary
        
        return {
            "success": True,
            "data": {
                "baseSalary": base_salary,
                "allowances": allowances,
                "bonus": 0,
                "deductions": deductions,
                "netSalary": net_salary
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/employee/payments")
def get_employee_payments(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        employee_id = current_user["employee_id"]
        query = text("""
            SELECT p.payroll_id, p.month, p.base_salary, p.total_allowance, 
                   p.total_deduction, p.net_salary
            FROM payrolls p
            WHERE p.employee_id = :emp_id
            ORDER BY p.month DESC
        """)
        results = db.execute(query, {"emp_id": employee_id}).fetchall()
        
        payments = []
        for row in results:
            month_date = row[1]
            payments.append({
                "id": str(row[0]),
                "month": str(month_date)[:7] if month_date else "",
                "year": int(str(month_date)[:4]) if month_date else 0,
                "baseSalary": float(row[2]) if row[2] else 0,
                "allowances": float(row[3]) if row[3] else 0,
                "bonus": 0,
                "deductions": float(row[4]) if row[4] else 0,
                "netSalary": float(row[5]) if row[5] else 0,
                "paidDate": str(month_date) if month_date else "",
                "status": "paid"
            })
        
        return {
            "success": True,
            "data": payments
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/employee/notifications")
def get_employee_notifications(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return {
            "success": True,
            "data": []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)