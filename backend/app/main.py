from fastapi import FastAPI, HTTPException, Depends, Cookie, Response
from sqlalchemy.orm import Session

from .db import get_db, test_connection
from .schemas import RegisterRequest, LoginRequest
from .models import User
from .auth import hash_password, verify_password
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.get("/test-db")
def test_db():
    value = test_connection()
    return {"database_connection": "success", "result": value}

@app.post("/register")
def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    if user_data.username:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="username already exists")
    new_user = User(
        email=user_data.email.lower(),
        username=user_data.username,
        password_hash=hash_password(user_data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Register successful",
        "user_id": str(new_user.user_id),
        "username": new_user.username,
        "email": new_user.email,
    }

@app.post("/login")
def login(user_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email.lower()).first()

    if not user:
        raise HTTPException(status_code=401, detail="The email is incorrect or not exist")
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="The password incorrect")
    response.set_cookie(
        key="user_id",
        value=str(user.user_id),
        httponly=True,
    )

    return {
        "message": "Login successful",
        "user_id": str(user.user_id),
        "username": user.username,
        "email": user.email,
    }

@app.get("/user")
def get_user(user_id: str = Cookie(None), db: Session = Depends(get_db)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return{
        "username": user.username,
        "email": user.email,
    }

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("user_id")
    return {"message": "Logged out"}