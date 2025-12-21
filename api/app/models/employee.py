from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Boolean, Table, Column, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# Association table for many-to-many relationship between employees and services
employee_services = Table(
    "employee_services",
    Base.metadata,
    Column("employee_id", Integer, ForeignKey("employees.id", ondelete="CASCADE"), primary_key=True),
    Column("service_id", Integer, ForeignKey("services.id", ondelete="CASCADE"), primary_key=True),
)


class Employee(Base):
    """Business employee/specialist model."""

    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    business: Mapped["Business"] = relationship("Business", back_populates="employees")
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="employee", lazy="selectin"
    )
    services: Mapped[list["Service"]] = relationship(
        "Service", secondary=employee_services, back_populates="employees", lazy="selectin"
    )
