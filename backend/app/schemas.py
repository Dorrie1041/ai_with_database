from typing import Optional
from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str