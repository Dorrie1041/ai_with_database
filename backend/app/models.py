from sqlalchemy import String, text
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
