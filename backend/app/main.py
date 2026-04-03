from fastapi import FastAPI, HTTPException, Depends, Cookie, Response, UploadFile, File
from sqlalchemy.orm import Session

from .db import get_db, test_connection
from .schemas import RegisterRequest, LoginRequest
from .models import User, UploadedFile
from .auth import hash_password, verify_password
from fastapi.middleware.cors import CORSMiddleware
from .storage import upload_file_to_gcs, generate_signed_download_url, generate_signed_preview_url, delete_file_from_gcs, download_file_from_gcs
import uuid
from .ai_agent import analyze_file_with_ai 


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

@app.post("/upload")
def upload_file(file: UploadFile=File(...),
                user_id: str = Cookie(None), 
                db: Session = Depends(get_db)):
    print("cookie user_id", user_id)
    if not user_id:
        raise HTTPException(status_code= 401, detail="Not logged in")
    

    filename = file.filename.lower()

    if not (filename.endswith(".csv") or filename.endswith(".json")):
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are allowed")
        

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    stored_filename = f"{uuid.uuid4()}-{file.filename}"
    gcs_object_name = f"uploads/{user_id}/{stored_filename}"

    upload_file_to_gcs(
        file.file,
        destination_blob_name=gcs_object_name,
        content_type=file.content_type,
    )

    new_file = UploadedFile(
        user_id=user_id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_size_bytes=file_size,
        storage_path = gcs_object_name,
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return {"message": "File uploaded successfully",
            "file_id": str(new_file.file_id),
            "original_filename": new_file.original_filename,
            "stored_filename": new_file.stored_filename,
            "gcs_object_name": gcs_object_name,}

@app.get("/files")
def list_files(
    user_id: str = Cookie(None),
    db: Session = Depends(get_db)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    files = (
        db.query(UploadedFile).filter(UploadedFile.user_id == user_id)
        .order_by(UploadedFile.created_at.desc())
        .all()
    )

    return [
        {
            "file_id": str(file.file_id),
            "original_filename": file.original_filename,
            "stored_filename": file.stored_filename,
            "file_size_bytes": file.file_size_bytes,
            "storage_path": file.storage_path,
            "created_at": file.created_at.isoformat() if file.created_at else None,
        }
        for file in files
    ]

@app.get("/files/{file_id}/download")
def download_file(
    file_id: str,
    user_id: str = Cookie(None),
    db: Session = Depends(get_db)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    file = (
        db.query(UploadedFile)
        .filter(UploadedFile.file_id == file_id)
        .first()
    )

    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if str(file.user_id) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if not file.storage_path:
        raise HTTPException(status_code=400, detail="Missing storage path")
    
    download_url = generate_signed_download_url(file.storage_path)

    return {
        "download_url": download_url,
        "filename": file.original_filename,
    }

@app.get("/files/{file_id}/preview")
def preview_file(
    file_id: str,
    user_id: str = Cookie(None),
    db: Session = Depends(get_db)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    file = (db.query(UploadedFile).
            filter(UploadedFile.file_id == file_id).
            first())

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    if str(file.user_id) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if not file.storage_path:
        raise HTTPException(status_code=400, detail="Missing storage path")
    
    preview_url = generate_signed_preview_url(file.storage_path)

    return {
        "preview_url": preview_url,
        "filename": file.original_filename,
    }
    

@app.delete("/files/{file_id}")
def delete_file(
    file_id: str,
    user_id: str = Cookie(None),
    db: Session = Depends(get_db)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    file = (db.query(UploadedFile).
            filter(UploadedFile.file_id == file_id).
            first())

    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if str(file.user_id) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if file.storage_path:
        delete_file_from_gcs(file.storage_path)
    
    db.delete(file)
    db.commit()

    return {"message" : "File {file_id} deleted successfully"}
        

@app.post("/agent/chat")
def agent_chat(
    data: dict,
    user_id: str = Cookie(None),
    db: Session = Depends(get_db)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    file_id = data.get("file_id")
    message = data.get("message")

    if not file_id or not message:
        raise HTTPException(status_code=400, detail="Missing data")
    
    file = db.query(UploadedFile).filter(UploadedFile.file_id == file_id).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if str(file.user_id) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    local_path = f"/tmp/{file.stored_filename}"

    download_file_from_gcs(file.storage_path, local_path)

    reply = analyze_file_with_ai(local_path, message)

    return {
        "reply": reply
    }
    



