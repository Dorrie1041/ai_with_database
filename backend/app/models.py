from sqlalchemy import String, text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from .base import Base

# ORM 
class User(Base):
    __tablename__ = "users" # connects the class to your database

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True), # Universally Unqiue Identifer : 550e8400-e29b-41d4-a716-446655440000
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    username: Mapped[str | None] = mapped_column(String, nullable=True, unique=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP(timezone=True), # Data + time + timezone
        nullable=False,
        server_default=("now()")
    )

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    file_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False
    )

    original_filename: Mapped[str] = mapped_column(String, nullable=False)
    stored_filename: Mapped[str] = mapped_column(String, nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    storage_path: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=("now()")
    )