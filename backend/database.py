<<<<<<< Updated upstream:backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Kết nối MySQL từ XAMPP (root, không mật khẩu, db: company_payroll)
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost/company_payroll"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
=======
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pymysql

# Kết nối MySQL từ XAMPP (root, không mật khẩu, db: company_payroll)
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/company_payroll?charset=utf8mb4"

# Thêm pool_recycle để tránh connection timeout
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_recycle=3600,  # Recycle connections every hour
    echo=True  # Hiển thị SQL queries (debug)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test connection
def test_connection():
    try:
        with engine.connect() as conn:
            print("✅ Kết nối database thành công!")
            # Test query
            result = conn.execute("SELECT COUNT(*) as count FROM employees")
            count = result.fetchone()['count']
            print(f"📊 Tổng số nhân viên: {count}")
            return True
    except Exception as e:
        print(f"❌ Lỗi kết nối database: {e}")
        return False

if __name__ == "__main__":
    test_connection()
>>>>>>> Stashed changes:database.py
