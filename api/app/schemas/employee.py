from datetime import datetime
from pydantic import BaseModel, ConfigDict, computed_field


class EmployeeBase(BaseModel):
    """Base employee schema."""

    name: str
    phone: str | None = None
    photo_url: str | None = None
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    """Employee creation schema."""

    service_ids: list[int] = []


class EmployeeUpdate(BaseModel):
    """Employee update schema."""

    name: str | None = None
    phone: str | None = None
    photo_url: str | None = None
    is_active: bool | None = None
    service_ids: list[int] | None = None


class Employee(EmployeeBase):
    """Employee response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def service_ids(self) -> list[int]:
        """Get list of service IDs from services relationship."""
        # Access the services relationship from the ORM model
        if hasattr(self, "services") and self.services:
            return [service.id for service in self.services]
        return []
