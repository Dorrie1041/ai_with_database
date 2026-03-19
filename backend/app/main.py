from fastapi import FastAPI
from .db import test_connection

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.get("/test-db")
def test_db():
    value = test_connection()
    return {"database_connection": "success", "result": value}