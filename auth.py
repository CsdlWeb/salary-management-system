from datetime import datetime, timedelta
from jose import jwt

# Cấu hình bảo mật
SECRET_KEY = "DUNGBACKEND_VERY_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Hàm kiểm tra mật khẩu (So sánh trực tiếp cho dễ test)
def verify_password(plain_password, stored_password):
    # So sánh trực tiếp chữ bạn nhập và chữ trong Database
    return str(plain_password) == str(stored_password)

# Hàm tạo mã JWT Token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)