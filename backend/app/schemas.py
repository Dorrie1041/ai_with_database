from typing import Optional
from pydantic import BaseModel, EmailStr

# define what data the api expects
# validate input automatically
# separate api layer from database layer

class RegisterRequest(BaseModel):
    email: EmailStr
    username: Optional[str] = None # str Or none (can be missing)
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str