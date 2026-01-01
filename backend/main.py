from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

app = FastAPI(title="Hệ thống Tính Lương - Dũng Backend")

# API Lấy nhân viên
@app.get("/employees", response_model=list[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

# API Tính lương
@app.post("/calculate-payroll")
def calculate_payroll(req: schemas.PayrollCalculateRequest, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.employee_id == req.employee_id).first()
    if not emp: raise HTTPException(status_code=404, detail="Nhân viên không tồn tại")
    
    pos = db.query(models.Position).filter(models.Position.position_id == emp.position_id).first()
    
    aln = db.query(models.Allowance).filter(
        models.Allowance.employee_id == req.employee_id, 
        models.Allowance.month == req.month
    ).first()
    total_allowance = (aln.allowance + aln.bonus) if aln else 0

    ded = db.query(models.Deduction).filter(
        models.Deduction.employee_id == req.employee_id, 
        models.Deduction.month == req.month
    ).first()
    total_deduction = (ded.insurance + ded.tax + ded.other) if ded else 0

    net_salary = (pos.base_salary + total_allowance) - total_deduction

    new_payroll = models.Payroll(
        employee_id=req.employee_id,
        month=req.month,
        base_salary=pos.base_salary,
        total_allowance=total_allowance,
        total_deduction=total_deduction,
        net_salary=net_salary
    )
    db.merge(new_payroll)
    db.commit()

    return {"status": "Thành công", "net_salary": net_salary}

# API Đăng nhập (JWT)
@app.post("/login")
def login(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    password = payload.get("password")

    # 1. Tìm user trong bảng users
    query = text("SELECT employee_id, email, password_hash, role_id FROM users WHERE email = :email AND is_active = 1")
    result = db.execute(query, {"email": email}).fetchone()

    # 2. Kiểm tra nếu không tìm thấy User
    if not result:
        raise HTTPException(status_code=401, detail="Email không tồn tại")

    # Chuyển kết quả thành dictionary để dễ lấy dữ liệu
    user = result._mapping 

    # Đảm bảo password_hash là string
    db_password = str(user["password_hash"])

    if not auth.verify_password(password, db_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mật khẩu không đúng"
    )

    # 4. Tạo token trả về cho Frontend
    access_token = auth.create_access_token(data={"sub": user["email"], "role_id": user["role_id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role_id": user["role_id"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)