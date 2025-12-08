from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ServiceBase(BaseModel):
    """Base service schema."""

    name: str
    description: str | None = None
    price_from: float
    price_to: float
    duration_minutes: int
    photo_url: str | None = None


class ServiceCreate(ServiceBase):
    """Service creation schema."""

    pass


class ServiceUpdate(BaseModel):
    """Service update schema."""

    name: str | None = None
    description: str | None = None
    price_from: float | None = None
    price_to: float | None = None
    duration_minutes: int | None = None
    photo_url: str | None = None
    is_active: bool | None = None


class Service(ServiceBase):
    """Service response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
