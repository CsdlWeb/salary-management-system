from datetime import datetime, timedelta
from jose import jwt

# Cấu hình bảo mật
SECRET_KEY = "DUNGBACKEND_VERY_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def verify_password(plain_password, stored_password):
    return str(plain_password) == str(stored_password)

# THÊM HÀM NÀY VÀO ĐỂ KHÔNG BỊ LỖI
def get_password_hash(password):
    return str(password) 

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)